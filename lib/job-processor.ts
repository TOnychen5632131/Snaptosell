import { Buffer } from "node:buffer";
import type { StorageError } from "@supabase/storage-js";
import type { SupabaseServiceClient } from "@/lib/supabase-admin";
import type { Database } from "@/types/supabase";

const BUCKET_NAME = "uploads";
const PRODUCT_MODEL = process.env.AIHUBMIX_PRODUCT_MODEL ?? "gemini-2.5-flash-image-preview";
const API_BASE_URL = process.env.AIHUBMIX_BASE_URL ?? "https://aihubmix.com/v1";
const API_KEY = process.env.AIHUBMIX_API_KEY ?? "";

export type ImageJobRow = Database["public"]["Tables"]["image_jobs"]["Row"];

const buildProcessedPath = (job: ImageJobRow, extension = "png") => {
  const safeExtension = extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "png";
  return `processed/${job.id}.${safeExtension}`;
};

const copyOriginalImage = async (
  client: SupabaseServiceClient,
  job: ImageJobRow
): Promise<{ path: string; publicUrl: string }> => {
  if (!job.original_storage_path) {
    throw new Error("缺少原始图片路径");
  }

  const processedPath = job.original_storage_path.startsWith("processed/")
    ? job.original_storage_path
    : job.original_storage_path.replace(/^uploads\//, "processed/");

  await client.storage.from(BUCKET_NAME).remove([processedPath]).catch(() => undefined);

  const { error: copyError } = await client.storage
    .from(BUCKET_NAME)
    .copy(job.original_storage_path, processedPath);

  if (copyError) {
    const error = copyError as StorageError;
    throw new Error(`复制图片失败: ${error.message}`);
  }

  const { data: publicData } = client.storage.from(BUCKET_NAME).getPublicUrl(processedPath);
  if (!publicData?.publicUrl) {
    throw new Error("无法生成图片外链");
  }

  return { path: processedPath, publicUrl: publicData.publicUrl };
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => Buffer.from(buffer).toString("base64");

const downloadOriginalImage = async (client: SupabaseServiceClient, path: string) => {
  const { data, error } = await client.storage.from(BUCKET_NAME).download(path);
  if (error || !data) {
    throw new Error(`下载图片失败: ${error?.message ?? "unknown"}`);
  }
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const callAihubmix = async (base64Image: string): Promise<{ buffer: Buffer; mimeType: string }> => {
  if (!API_KEY) {
    throw new Error("AIHUBMIX_API_KEY 未配置");
  }

  const payload = {
    model: PRODUCT_MODEL,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Generate an e-commerce ready product photo using children crayon style.",
          },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
        ],
      },
    ],
    modalities: ["text", "image"],
    temperature: 0.7,
  };

  const response = await fetch(`${API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AiHubMix 调用失败: ${response.status} ${errorText}`);
  }

  const json = await response.json();
  const multiContent = json?.choices?.[0]?.message?.multi_mod_content ?? [];
  const imagePart = multiContent.find((part: any) => part?.inline_data?.data);

  if (!imagePart?.inline_data?.data) {
    throw new Error("模型未返回图片数据");
  }

  const mimeType: string = imagePart.inline_data.mime_type ?? "image/png";
  const buffer = Buffer.from(imagePart.inline_data.data, "base64");
  return { buffer, mimeType };
};

const uploadGeneratedImage = async (
  client: SupabaseServiceClient,
  job: ImageJobRow,
  buffer: Buffer,
  mimeType: string
) => {
  const extension = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";
  const processedPath = buildProcessedPath(job, extension);

  const { error: uploadError } = await client.storage
    .from(BUCKET_NAME)
    .upload(processedPath, buffer, { upsert: true, contentType: mimeType });

  if (uploadError) {
    throw new Error(`上传生成图片失败: ${uploadError.message}`);
  }

  const { data: publicData } = client.storage.from(BUCKET_NAME).getPublicUrl(processedPath);
  if (!publicData?.publicUrl) {
    throw new Error("无法生成生成图片的外链");
  }

  return { path: processedPath, publicUrl: publicData.publicUrl };
};

export const processImageJob = async (
  client: SupabaseServiceClient,
  job: ImageJobRow
): Promise<ImageJobRow> => {
  if (!job.original_storage_path) {
    throw new Error("缺少原始图片路径");
  }

  let processedPath = "";
  let processedImageUrl = "";

  if (job.mode === "product") {
    const originalBuffer = await downloadOriginalImage(client, job.original_storage_path);
    const base64Image = originalBuffer.toString("base64");
    const { buffer: generatedBuffer, mimeType } = await callAihubmix(base64Image);
    const result = await uploadGeneratedImage(client, job, generatedBuffer, mimeType);
    processedPath = result.path;
    processedImageUrl = result.publicUrl;
  } else {
    const result = await copyOriginalImage(client, job);
    processedPath = result.path;
    processedImageUrl = result.publicUrl;
  }

  const { data: updatedJob, error: updateError } = await (client.from("image_jobs") as any)
    .update({
      state: "done",
      processed_image_url: processedImageUrl,
      updated_at: new Date().toISOString(),
      failure_reason: null,
      original_preview_url: job.original_preview_url ?? processedImageUrl,
      mode: job.mode ?? "product",
      cost_credits: job.cost_credits ?? 0,
      thumbnail_url: processedImageUrl,
      original_storage_path: job.original_storage_path,
    })
    .eq("id", job.id)
    .select()
    .single();

  if (updateError || !updatedJob) {
    throw new Error(updateError?.message ?? "更新任务记录失败");
  }

  return updatedJob as ImageJobRow;
};

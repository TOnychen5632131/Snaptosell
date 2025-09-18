"use client";
import { useState } from "react";
import { useSupabase } from "@/providers/supabase-provider";
import { useJobQueue } from "@/hooks/use-job-queue";

const trigger = (id: string) => {
  const input = document.getElementById(id) as HTMLInputElement | null;
  input?.click();
};

export const useUpload = () => {
  const [isUploading, setUploading] = useState(false);
  const supabase = useSupabase();
  const { setJob } = useJobQueue();

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const path = `uploads/${fileName}`;

      const { error } = await supabase.storage.from("uploads").upload(path, file, {
        cacheControl: "3600",
        upsert: true
      });
      if (error) throw error;

      const previewUrl = URL.createObjectURL(file);

      const { data, error: funcError } = await supabase.functions.invoke("jobs-create", {
        body: {
          originalStoragePath: path,
          previewUrl,
          mode: "enhance"
        }
      });

      if (funcError) throw funcError;
      if (data) {
        setJob({
          id: data.id,
          state: data.state,
          originalStoragePath: data.original_storage_path,
          originalPreviewUrl: previewUrl,
          processedImageUrl: data.processed_image_url
        });
      }
    } catch (error) {
      console.error(error);
      alert("上传失败，请稍后再试");
    } finally {
      setUploading(false);
    }
  };

  return {
    isUploading,
    triggerCamera: () => trigger("camera-input"),
    triggerLibrary: () => trigger("library-input"),
    handleFile
  };
};

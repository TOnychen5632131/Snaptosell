"use client";
import { create } from "zustand";
import { useEffect } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useSupabase } from "@/providers/supabase-provider";
import type { SupabaseBrowserClient } from "@/providers/supabase-provider";

export type JobItem = {
  id: string;
  state: "pending" | "processing" | "done" | "failed";
  originalStoragePath?: string;
  originalPreviewUrl?: string;
  processedImageUrl?: string;
  failure_reason?: string;
  updated_at?: string;
  thumbnailUrl?: string;
  displayId?: string;
  mode?: string;
  localFile?: File;
  costCredits?: number;
};

type JobQueueState = {
  currentJob?: JobItem;
  recentJobs: JobItem[];
  status?: { state: "processing" | "success" | "error"; message?: string };
  setJob: (job: JobItem) => void;
  openJob: (id: string) => void;
  startJob: (mode: string, supabase: SupabaseBrowserClient, options?: { costCredits?: number }) => Promise<void>;
  share: () => void;
  isSubmitting: boolean;
};

export const useJobQueue = create<JobQueueState>((set, get) => ({
  recentJobs: [],
  isSubmitting: false,
  setJob(job) {
    set((state) => ({
      currentJob: job,
      recentJobs: [job, ...state.recentJobs.filter((item) => item.id !== job.id)].slice(0, 10),
      status: { state: "processing", message: "照片已准备，可提交处理" }
    }));
  },
  openJob(id) {
    set((state) => {
      const job = state.recentJobs.find((item) => item.id === id);
      if (!job) {
        return { status: { state: "error", message: "未找到该任务记录" } };
      }
      return { currentJob: job, status: undefined };
    });
  },
  async startJob(mode, supabase: SupabaseBrowserClient, options) {
    if (get().isSubmitting) return;
    const job = get().currentJob;
    if (!job) {
      set({ status: { state: "error", message: "请先选择商品照片" } });
      return;
    }

    if (!job.originalStoragePath && !job.localFile) {
      set({ status: { state: "error", message: "请先选择商品照片" } });
      return;
    }

    if (job.state === "pending" || job.state === "processing") {
      set({ status: { state: "processing", message: "已提交任务，请稍候…" } });
      // Prevent duplicate submissions while we wait for realtime updates.
      if (!job.localFile && job.originalStoragePath) {
        return;
      }
    }

    const costCredits = options?.costCredits ?? 0;

    set({
      isSubmitting: true,
      status: {
        state: "processing",
        message: costCredits > 0 ? `扣除 ${costCredits} 积分中，请稍候…` : "上传中，请稍候…"
      }
    });

    let storagePath = job.originalStoragePath;
    const previewUrl = job.originalPreviewUrl;

    try {
      if (!storagePath && job.localFile) {
        const file = job.localFile;
        const ext = file.name.split(".").pop() ?? "jpg";
        const fileName = `${crypto.randomUUID()}.${ext}`;
        storagePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("uploads").upload(storagePath, file, {
          cacheControl: "3600",
          upsert: true
        });

        if (uploadError) throw uploadError;
      }

      if (!storagePath) {
        throw new Error("无法确定上传路径");
      }

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          originalStoragePath: storagePath,
          previewUrl,
          mode,
          costCredits
        })
      });

      let payload: any = null;
      try {
        payload = await response.json();
      } catch (error) {
        // ignore parse errors when body is empty
      }

      if (!response.ok || !payload) {
        const message = typeof payload?.error === "string" ? payload.error : "任务创建失败";
        throw new Error(message);
      }

      const rawJob = (payload?.imageJob ?? payload) as {
        id: string;
        state: JobItem["state"];
        original_storage_path?: string | null;
        original_preview_url?: string | null;
        processed_image_url?: string | null;
        updated_at?: string | null;
        mode?: string | null;
        cost_credits?: number | null;
        display_id?: string | null;
        thumbnail_url?: string | null;
      };

      const data = rawJob;

      const submittedJob: JobItem = {
        ...job,
        id: data.id,
        state: data.state,
        originalStoragePath: data.original_storage_path ?? storagePath,
        originalPreviewUrl: data.original_preview_url ?? previewUrl,
        processedImageUrl: data.processed_image_url ?? job.processedImageUrl,
        updated_at: data.updated_at ?? new Date().toISOString(),
        mode,
        localFile: undefined,
        displayId: data.display_id ?? job.displayId,
        thumbnailUrl: data.thumbnail_url ?? job.thumbnailUrl,
        costCredits: data.cost_credits ?? costCredits
      };

      set((state) => ({
        currentJob: submittedJob,
        recentJobs: [submittedJob, ...state.recentJobs.filter((item) => item.id !== submittedJob.id)].slice(0, 10),
        status: { state: "processing", message: "任务已提交，处理中…" }
      }));

      // 如果接口返回最新积分，触发 useCredits 重新获取
      if (typeof payload?.balance === "number" && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("credits:updated"));
      }
    } catch (error) {
      console.error(error);
      set((state) => {
        const currentJob = state.currentJob && storagePath ? { ...state.currentJob, originalStoragePath: storagePath } : state.currentJob;
        return {
          currentJob,
          status: {
            state: "error",
            message: error instanceof Error ? error.message : "提交失败，请稍后再试"
          }
        };
      });
    } finally {
      set({ isSubmitting: false });
    }
  },
  share() {
    const job = get().currentJob;
    if (!job?.processedImageUrl) return;
    navigator.clipboard.writeText(job.processedImageUrl);
    set({ status: { state: "success", message: "链接已复制，可分享给好友" } });
  }
}));

export const JobQueueSubscriber = () => {
  const supabase = useSupabase();

  useEffect(() => {
    const channel = supabase
      .channel("public:image_jobs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "image_jobs" },
        (payload: RealtimePostgresChangesPayload<JobItem>) => {
          const job = payload.new as JobItem;
          useJobQueue.setState((state) => ({
            recentJobs: [job, ...state.recentJobs.filter((item) => item.id !== job.id)].slice(0, 10),
            currentJob: state.currentJob?.id === job.id ? job : state.currentJob,
            status:
              job.state === "done"
                ? { state: "success", message: "修图完成！" }
                : job.state === "failed"
                ? { state: "error", message: job.failure_reason ?? "生成失败" }
                : state.status
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);
  return null;
};

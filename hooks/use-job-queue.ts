"use client";
import { create } from "zustand";
import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-client";

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
};

type JobQueueState = {
  currentJob?: JobItem;
  recentJobs: JobItem[];
  status?: { state: "processing" | "success" | "error"; message?: string };
  setJob: (job: JobItem) => void;
  openJob: (id: string) => void;
  startJob: (mode: string) => Promise<void>;
  share: () => void;
};

export const useJobQueue = create<JobQueueState>((set, get) => ({
  recentJobs: [],
  setJob(job) {
    set((state) => ({
      currentJob: job,
      recentJobs: [job, ...state.recentJobs.filter((item) => item.id !== job.id)].slice(0, 10),
      status: { state: "processing", message: "任务已创建" }
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
  async startJob(mode) {
    const job = get().currentJob;
    if (!job?.originalStoragePath) {
      set({ status: { state: "error", message: "请先上传商品照片" } });
      return;
    }

    if (job.state === "pending" || job.state === "processing") {
      set({ status: { state: "processing", message: "任务处理中，请稍候…" } });
      return;
    }

    set({ status: { state: "processing", message: "正在提交任务…" } });

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalStoragePath: job.originalStoragePath,
          previewUrl: job.originalPreviewUrl,
          mode
        })
      });

      const payload = await response.json().catch(() => undefined);
      if (!response.ok || !payload) {
        throw new Error((payload as { error?: string })?.error ?? "任务提交失败，请稍后重试");
      }

      const data = payload as Record<string, unknown>;
      const nextJob: JobItem = {
        id: String(data.id ?? crypto.randomUUID()),
        state: (data.state as JobItem["state"]) ?? "pending",
        originalStoragePath: (data.original_storage_path as string | undefined) ?? job.originalStoragePath,
        originalPreviewUrl: (data.original_preview_url as string | undefined) ?? job.originalPreviewUrl,
        processedImageUrl: (data.processed_image_url as string | undefined) ?? job.processedImageUrl,
        failure_reason: data.failure_reason as string | undefined,
        updated_at: data.updated_at as string | undefined,
        thumbnailUrl: (data.thumbnail_url as string | undefined) ?? job.thumbnailUrl,
        displayId: (data.display_id as string | undefined) ?? job.displayId,
        mode: (data.mode as string | undefined) ?? mode
      };

      set((state) => ({
        currentJob: nextJob,
        recentJobs: [nextJob, ...state.recentJobs.filter((item) => item.id !== nextJob.id)].slice(0, 10),
        status: { state: "processing", message: "任务排队中…" }
      }));
    } catch (error) {
      console.error(error);
      set({
        status: {
          state: "error",
          message: error instanceof Error ? error.message : "任务提交失败，请稍后重试"
        }
      });
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
  useEffect(() => {
    const supabase = supabaseBrowser();
    const channel = supabase
      .channel("public:image_jobs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "image_jobs" },
        (payload) => {
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
  }, []);
  return null;
};

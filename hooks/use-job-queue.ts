"use client";
import { create } from "zustand";
import { useEffect } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useSupabase } from "@/providers/supabase-provider";

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

    const requestId = crypto.randomUUID();
    const processingJob: JobItem = {
      ...job,
      id: job.id || requestId,
      state: "processing",
      mode
    };

    set((state) => ({
      currentJob: processingJob,
      recentJobs: [processingJob, ...state.recentJobs.filter((item) => item.id !== processingJob.id)].slice(0, 10),
      status: { state: "processing", message: "高清处理中…" }
    }));

    await new Promise((resolve) => setTimeout(resolve, 1800));

    const processedImageUrl = processingJob.originalPreviewUrl ?? processingJob.processedImageUrl ?? "";

    const finishedJob: JobItem = {
      ...processingJob,
      state: "done",
      processedImageUrl,
      updated_at: new Date().toISOString()
    };

    set((state) => ({
      currentJob: finishedJob,
      recentJobs: [finishedJob, ...state.recentJobs.filter((item) => item.id !== finishedJob.id)].slice(0, 10),
      status: {
        state: "success",
        message: processedImageUrl ? "高清完成，快去查看效果吧！" : "处理完成，但未获取到高清图"
      }
    }));
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

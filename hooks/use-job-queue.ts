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
};

type JobQueueState = {
  currentJob?: JobItem;
  recentJobs: JobItem[];
  status?: { state: "processing" | "success" | "error"; message?: string };
  setJob: (job: JobItem) => void;
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

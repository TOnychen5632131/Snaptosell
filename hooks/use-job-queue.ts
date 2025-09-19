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
};

type JobQueueState = {
  currentJob?: JobItem;
  recentJobs: JobItem[];
  status?: { state: "processing" | "success" | "error"; message?: string };
  setJob: (job: JobItem) => void;
  openJob: (id: string) => void;
  startJob: (mode: string, supabase: SupabaseBrowserClient) => Promise<void>;
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
  async startJob(mode, supabase: SupabaseBrowserClient) {
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

    set({ isSubmitting: true, status: { state: "processing", message: "上传中，请稍候…" } });

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

      const { data, error: funcError } = await supabase.functions.invoke("jobs-create", {
        body: {
          originalStoragePath: storagePath,
          previewUrl,
          mode
        }
      });

      if (funcError) throw funcError;
      if (!data) throw new Error("任务创建失败");

      const submittedJob: JobItem = {
        ...job,
        id: data.id,
        state: data.state,
        originalStoragePath: data.original_storage_path ?? storagePath,
        processedImageUrl: data.processed_image_url,
        updated_at: data.updated_at ?? new Date().toISOString(),
        mode,
        localFile: undefined
      };

      set((state) => ({
        currentJob: submittedJob,
        recentJobs: [submittedJob, ...state.recentJobs.filter((item) => item.id !== submittedJob.id)].slice(0, 10),
        status: { state: "processing", message: "任务已提交，处理中…" }
      }));
    } catch (error) {
      console.error(error);
      set((state) => {
        const currentJob = state.currentJob && storagePath ? { ...state.currentJob, originalStoragePath: storagePath } : state.currentJob;
        return {
          currentJob,
          status: { state: "error", message: "提交失败，请稍后再试" }
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

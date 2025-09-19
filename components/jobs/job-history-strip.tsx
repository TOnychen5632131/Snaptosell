"use client";
import Image from "next/image";
import { useJobQueue } from "@/hooks/use-job-queue";

export const JobHistoryStrip = () => {
  const { recentJobs, openJob } = useJobQueue();
  if (!recentJobs.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">最近处理</h3>
        <span className="text-xs text-slate-400">最多展示 10 条</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {recentJobs.map((job) => (
          <button
            key={job.id}
            onClick={() => openJob(job.id)}
            className="flex w-36 flex-col gap-2 rounded-2xl bg-white p-3 text-left shadow-card transition hover:-translate-y-1"
          >
            {job.thumbnailUrl ? (
              <Image
                src={job.thumbnailUrl}
                alt="历史记录"
                width={144}
                height={96}
                className="h-24 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-24 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                无预览
              </div>
            )}
            <div className="text-xs text-slate-500">
              <p className="font-semibold text-slate-700">#{job.displayId ?? job.id.slice(0, 6)}</p>
              <p>{job.state === "done" ? "已完成" : job.state === "failed" ? "失败" : "进行中"}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

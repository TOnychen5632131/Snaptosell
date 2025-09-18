"use client";
import { useJobQueue } from "@/hooks/use-job-queue";

export const DebugConsole = () => {
  const { recentJobs } = useJobQueue();
  if (!process.env.NEXT_PUBLIC_ENABLE_DEBUG) return null;

  return (
    <div className="fixed bottom-4 right-4 hidden max-h-64 w-80 flex-col overflow-hidden rounded-2xl bg-black/80 p-4 text-xs text-white shadow-card md:flex">
      <h4 className="mb-2 font-semibold">调试记录</h4>
      <div className="flex-1 overflow-y-auto space-y-2">
        {recentJobs.map((job) => (
          <div key={job.id} className="rounded-lg bg-white/10 p-2">
            <p>ID: {job.id}</p>
            <p>状态: {job.state}</p>
            {job.failure_reason && <p>错误: {job.failure_reason}</p>}
          </div>
        ))}
        {!recentJobs.length && <p className="text-white/60">暂无记录</p>}
      </div>
    </div>
  );
};

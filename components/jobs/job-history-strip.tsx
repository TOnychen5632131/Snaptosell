"use client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useJobQueue } from "@/hooks/use-job-queue";

export const JobHistoryStrip = () => {
  const t = useTranslations('JobHistoryStrip');
  const { recentJobs, openJob } = useJobQueue();
  if (!recentJobs.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200/90">{t('title')}</h3>
        <span className="text-xs text-slate-200/60">{t('limitNotice')}</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {recentJobs.map((job) => (
          <button
            key={job.id}
            onClick={() => openJob(job.id)}
            className="group relative flex w-36 flex-col gap-2 rounded-2xl border border-white/40 bg-white/15 p-3 text-left text-slate-800 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.75)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/60 hover:bg-white/25"
          >
            {job.thumbnailUrl ? (
              <Image
                src={job.thumbnailUrl}
                alt={t('historyAlt')}
                width={144}
                height={96}
                className="h-24 w-full rounded-xl border border-white/40 object-cover shadow-[0_12px_30px_-22px_rgba(15,23,42,0.6)]"
              />
            ) : (
              <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-white/50 bg-white/10 text-xs text-slate-500 backdrop-blur-xl">
                {t('noPreview')}
              </div>
            )}
            <div className="text-xs text-slate-600">
              <p className="font-semibold text-slate-800">#{job.displayId ?? job.id.slice(0, 6)}</p>
              <p>{job.state === "done" ? t('statusDone') : job.state === "failed" ? t('statusFailed') : t('statusInProgress')}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

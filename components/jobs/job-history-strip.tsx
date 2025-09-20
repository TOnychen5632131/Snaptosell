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
        <h3 className="text-sm font-semibold text-slate-700">{t('title')}</h3>
        <span className="text-xs text-slate-400">{t('limitNotice')}</span>
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
                alt={t('historyAlt')}
                width={144}
                height={96}
                className="h-24 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-24 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                {t('noPreview')}
              </div>
            )}
            <div className="text-xs text-slate-500">
              <p className="font-semibold text-slate-700">#{job.displayId ?? job.id.slice(0, 6)}</p>
              <p>{job.state === "done" ? t('statusDone') : job.state === "failed" ? t('statusFailed') : t('statusInProgress')}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

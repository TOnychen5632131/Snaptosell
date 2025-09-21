"use client";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useJobQueue } from "@/hooks/use-job-queue";

export const StatusBanner = () => {
  const t = useTranslations('StatusBanner');
  const { status } = useJobQueue();
  if (!status) return null;

  const state = status.state;
  const message = status.message;

  const baseClasses =
    "relative flex items-center gap-3 overflow-hidden rounded-2xl border px-5 py-4 text-sm backdrop-blur-xl shadow-[0_24px_52px_-32px_rgba(15,23,42,0.28)]";
  const config =
    state === "processing"
      ? {
          icon: <Loader2 className="h-5 w-5 animate-spin" />,
          classes: `${baseClasses} border-sky-200/70 bg-sky-100/65 text-slate-800`,
          text: message ?? t('processing')
        }
      : state === "success"
      ? {
          icon: <CheckCircle2 className="h-5 w-5" />,
          classes: `${baseClasses} border-emerald-200/70 bg-emerald-100/65 text-slate-800`,
          text: message ?? t('success')
        }
      : {
          icon: <AlertCircle className="h-5 w-5" />,
          classes: `${baseClasses} border-rose-200/75 bg-rose-100/65 text-slate-800`,
          text: message ?? t('error')
        };

  return (
    <div className={config.classes}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

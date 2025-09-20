"use client";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useJobQueue } from "@/hooks/use-job-queue";

export const StatusBanner = () => {
  const t = useTranslations('StatusBanner');
  const { status } = useJobQueue();
  if (!status) return null;

  const state = status.state;
  const message = status.message;

  const config =
    state === "processing"
      ? { icon: <Loader2 className="h-5 w-5 animate-spin" />, classes: "border-blue-200 bg-blue-50 text-blue-600", text: message ?? t('processing') }
      : state === "success"
      ? { icon: <CheckCircle2 className="h-5 w-5" />, classes: "border-emerald-200 bg-emerald-50 text-emerald-600", text: message ?? t('success') }
      : { icon: <AlertCircle className="h-5 w-5" />, classes: "border-rose-200 bg-rose-50 text-rose-600", text: message ?? t('error') };

  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-card ${config.classes}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

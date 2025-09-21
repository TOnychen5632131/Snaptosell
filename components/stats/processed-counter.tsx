"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useProcessedCount } from "@/hooks/use-processed-count";

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

export const ProcessedCounter = () => {
  const t = useTranslations("ProcessedCounter");
  const { totalProcessed, error, isLoading } = useProcessedCount();
  const [displayTotal, setDisplayTotal] = useState(0);
  const animationRef = useRef<number>();
  const latestValueRef = useRef(0);

  useEffect(() => {
    latestValueRef.current = displayTotal;
  }, [displayTotal]);

  useEffect(() => {
    if (!Number.isFinite(totalProcessed)) return;

    const startValue = latestValueRef.current;
    const diff = totalProcessed - startValue;
    if (diff === 0) return;

    const duration = Math.min(4000, Math.max(800, Math.abs(diff) * 40));
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutCubic(progress);
      const nextValue = Math.round(startValue + diff * eased);
      latestValueRef.current = nextValue;
      setDisplayTotal(nextValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      }
    };

    animationRef.current = requestAnimationFrame(step);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [totalProcessed]);

  useEffect(() => {
    if (displayTotal === 0 && totalProcessed > 0) {
      setDisplayTotal(totalProcessed);
      latestValueRef.current = totalProcessed;
    }
  }, [displayTotal, totalProcessed]);

  const formattedTotal = useMemo(
    () => displayTotal.toLocaleString(undefined, { maximumFractionDigits: 0 }),
    [displayTotal]
  );

  return (
    <section className="rounded-card bg-white/90 p-6 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-primary">
            {t("heading")}
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-800">{t("title")}</h3>
          <p className="mt-2 max-w-lg text-sm text-slate-500">{t("description")}</p>
          <StatusMessage error={error} isLoading={isLoading} />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-inner">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60">
            <div className="h-full w-full -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
          <div className="relative z-10 flex flex-col items-end text-right">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/60">
              {t("metricLabel")}
            </span>
            <span className="mt-1 font-mono text-4xl font-bold leading-none tabular-nums">
              {formattedTotal}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

type StatusMessageProps = {
  error?: Error;
  isLoading: boolean;
};

const StatusMessage = ({ error, isLoading }: StatusMessageProps) => {
  const t = useTranslations("ProcessedCounter");

  if (error) {
    return (
      <p className="mt-2 flex items-center gap-2 text-sm text-rose-600">
        <span aria-hidden>⚠️</span>
        <span>{t("statusError", { message: error.message })}</span>
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" aria-hidden />
        <span>{t("statusLoading")}</span>
      </p>
    );
  }

  return null;
};

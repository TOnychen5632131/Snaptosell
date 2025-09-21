"use client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Image as ImageIcon, Sparkles } from "lucide-react";
import { useRef } from "react";
import { useJobQueue } from "@/hooks/use-job-queue";
import { useCredits } from "@/hooks/use-credits";
import { openViewer } from "@/lib/ui-state";

const Panel = ({
  title,
  icon,
  imageUrl,
  emptyText,
  zoomText,
  onSecretClick
}: {
  title: string;
  icon: React.ReactNode;
  imageUrl?: string;
  emptyText: string;
  zoomText: string;
  onSecretClick?: () => void;
}) => (
  <div className="glass-card p-5 text-slate-900">
    <div className="mb-4 flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/75 bg-white/75 text-brand-primary shadow-[0_16px_34px_-24px_rgba(59,130,246,0.35)]">{icon}</div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
    </div>
    {imageUrl ? (
      <button
        onClick={() => {
          onSecretClick?.();
          openViewer(imageUrl);
        }}
        className="group relative block overflow-hidden rounded-2xl border border-white/75 bg-white/70 shadow-[0_24px_55px_-34px_rgba(15,23,42,0.26)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/85 hover:bg-white/80 hover:shadow-[0_30px_65px_-36px_rgba(15,23,42,0.3)]"
      >
        <Image
          src={imageUrl}
          alt={title}
          width={1024}
          height={1024}
          className="mx-auto block h-full w-full rounded-2xl object-contain"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        <span className="absolute bottom-3 right-3 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs text-slate-700 backdrop-blur-xl opacity-0 transition group-hover:opacity-100">
          {zoomText}
        </span>
      </button>
    ) : (
      <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/75 bg-white/70 text-slate-500 backdrop-blur-xl">
        <ImageIcon className="h-10 w-10 text-brand-primary/70" />
        <p className="text-sm text-slate-600">{emptyText}</p>
      </div>
    )}
  </div>
);

export const ImagePanels = () => {
  const t = useTranslations('ImagePanels');
  const { currentJob } = useJobQueue();
  const { mutate } = useCredits();
  const secretState = useRef({ lastTap: 0, count: 0, boosting: false });

  const handleSecretTap = async () => {
    const now = Date.now();
    if (now - secretState.current.lastTap > 4000) {
      secretState.current.count = 0;
    }
    secretState.current.lastTap = now;
    secretState.current.count += 1;

    if (secretState.current.count < 5 || secretState.current.boosting) {
      return;
    }

    secretState.current.count = 0;
    secretState.current.boosting = true;

    try {
      const res = await fetch("/api/credits/boost", { method: "POST" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error ?? t('creditBoostFailed'));
      }
      useJobQueue.setState({ status: { state: "success", message: t('creditBoostSuccess') } });
      mutate();
    } catch (error) {
      console.error(error);
      useJobQueue.setState({
        status: {
          state: "error",
          message: error instanceof Error ? error.message : t('creditBoostFailed')
        }
      });
    } finally {
      secretState.current.boosting = false;
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel
        title={t('originalImageTitle')}
        icon={<ImageIcon className="h-4 w-4" />}
        imageUrl={currentJob?.originalPreviewUrl}
        emptyText={t('originalImageEmpty')}
        zoomText={t('zoomIn')}
        onSecretClick={handleSecretTap}
      />
      <Panel 
        title={t('processedImageTitle')} 
        icon={<Sparkles className="h-4 w-4" />} 
        imageUrl={currentJob?.processedImageUrl} 
        emptyText={t('processedImageEmpty')} 
        zoomText={t('zoomIn')}
      />
    </div>
  );
};

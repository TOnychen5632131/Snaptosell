"use client";
import { Image as ImageIcon, Sparkles } from "lucide-react";
import { useJobQueue } from "@/hooks/use-job-queue";
import { openViewer } from "@/lib/ui-state";

const Panel = ({
  title,
  icon,
  imageUrl,
  emptyText
}: {
  title: string;
  icon: React.ReactNode;
  imageUrl?: string;
  emptyText: string;
}) => (
  <div className="rounded-card bg-white p-5 shadow-card">
    <div className="mb-4 flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">{icon}</div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
    </div>
    {imageUrl ? (
      <button
        onClick={() => openViewer(imageUrl)}
        className="group relative block overflow-hidden rounded-2xl bg-slate-100 transition hover:shadow-soft"
      >
        <img src={imageUrl} alt={title} className="mx-auto block h-full w-full rounded-2xl object-contain" />
        <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
          点击放大
        </span>
      </button>
    ) : (
      <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
        <ImageIcon className="h-10 w-10" />
        <p className="text-sm">{emptyText}</p>
      </div>
    )}
  </div>
);

export const ImagePanels = () => {
  const { currentJob } = useJobQueue();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="原图" icon={<ImageIcon className="h-4 w-4" />} imageUrl={currentJob?.originalPreviewUrl} emptyText="上传或拍摄一张商品照片" />
      <Panel title="修图结果" icon={<Sparkles className="h-4 w-4" />} imageUrl={currentJob?.processedImageUrl} emptyText="等待生成完成，结果会显示在这里" />
    </div>
  );
};

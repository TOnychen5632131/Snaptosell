"use client";
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
  onSecretClick
}: {
  title: string;
  icon: React.ReactNode;
  imageUrl?: string;
  emptyText: string;
  onSecretClick?: () => void;
}) => (
  <div className="rounded-card bg-white p-5 shadow-card">
    <div className="mb-4 flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">{icon}</div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
    </div>
    {imageUrl ? (
      <button
        onClick={() => {
          onSecretClick?.();
          openViewer(imageUrl);
        }}
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
        throw new Error(payload?.error ?? "积分增加失败");
      }
      useJobQueue.setState({ status: { state: "success", message: "积分 +1000（测试后门）" } });
      mutate();
    } catch (error) {
      console.error(error);
      useJobQueue.setState({
        status: {
          state: "error",
          message: error instanceof Error ? error.message : "积分增加失败"
        }
      });
    } finally {
      secretState.current.boosting = false;
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel
        title="原图"
        icon={<ImageIcon className="h-4 w-4" />}
        imageUrl={currentJob?.originalPreviewUrl}
        emptyText="上传或拍摄一张商品照片"
        onSecretClick={handleSecretTap}
      />
      <Panel title="修图结果" icon={<Sparkles className="h-4 w-4" />} imageUrl={currentJob?.processedImageUrl} emptyText="等待生成完成，结果会显示在这里" />
    </div>
  );
};

"use client";
import { Camera, Download, ImagePlus, Loader2, Package, Share2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUpload } from "@/hooks/use-upload";
import { useJobQueue } from "@/hooks/use-job-queue";
import { useSupabase } from "@/providers/supabase-provider";
import { ChangeEvent } from "react";

export const ActionGrid = () => {
  const t = useTranslations('ActionGrid');
  const { triggerCamera, triggerLibrary, isPreparing, handleFile } = useUpload();
  const { currentJob, startJob, share, isSubmitting } = useJobQueue();
  const supabase = useSupabase();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = "";
  };

  const download = async () => {
    if (!currentJob?.processedImageUrl) return;

    try {
      const response = await fetch(currentJob.processedImageUrl);
      if (!response.ok) throw new Error("Image download failed.");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentJob.id ? `${currentJob.id}.png` : "image.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      // You might want to show a user-facing error message here
    }
  };

  return (
    <>
      <input id="camera-input" type="file" accept="image/*" capture="environment" className="hidden" onChange={onChange} />
      <input id="library-input" type="file" accept="image/*" className="hidden" onChange={onChange} />

      <section className="toolbar">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          <p className="col-span-2 text-xs font-medium text-slate-500 sm:col-span-6">
            {t('step1Label')}
          </p>
          <button
            className="action-button action-button--primary"
            onClick={triggerCamera}
            disabled={isPreparing || isSubmitting}
          >
            <Camera className="h-6 w-6" />
            <span>{t('takePhoto')}</span>
          </button>
          <button className="action-button" onClick={triggerLibrary} disabled={isPreparing || isSubmitting}>
            <ImagePlus className="h-6 w-6 text-brand-primary" />
            <span>{t('fromAlbum')}</span>
          </button>
          <p className="col-span-2 mt-2 text-xs font-medium text-slate-500 sm:col-span-6">
            {t('step2Label')}
          </p>
          <button
            className="action-button action-button--emerald"
            onClick={() => startJob("enhance", supabase, { costCredits: 0 })}
            disabled={isSubmitting || (!currentJob?.localFile && !currentJob?.originalStoragePath)}
          >
            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
            <span>{isSubmitting ? t('uploading') : t('enhanceQuality')}</span>
          </button>
          <button
            className="action-button action-button--violet"
            onClick={() => startJob("product", supabase, { costCredits: 600 })}
            disabled={isSubmitting || (!currentJob?.localFile && !currentJob?.originalStoragePath)}
          >
            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Package className="h-6 w-6" />}
            <span>{isSubmitting ? t('processing') : t('generateProductPhoto')}</span>
          </button>
          <p className="col-span-2 mt-2 text-xs font-medium text-slate-500 sm:col-span-6">
            {t('step3Label')}
          </p>
          <button
            className="action-button action-button--rose"
            onClick={() => {
              void share();
            }}
            disabled={isSubmitting}
          >
            <Share2 className="h-6 w-6" />
            <span>{t('share')}</span>
          </button>
          <button
            className="action-button"
            onClick={download}
            disabled={!currentJob?.processedImageUrl}
          >
            <Download className="h-6 w-6 text-brand-primary" />
            <span>{t('downloadImage')}</span>
          </button>
        </div>
      </section>

    </>
  );
};

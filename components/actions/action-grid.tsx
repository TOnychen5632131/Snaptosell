"use client";
import { Camera, ImagePlus, Loader2, Share2, Sparkles } from "lucide-react";
import { useUpload } from "@/hooks/use-upload";
import { useJobQueue } from "@/hooks/use-job-queue";
import { ChangeEvent } from "react";

export const ActionGrid = () => {
  const { triggerCamera, triggerLibrary, isUploading, handleFile } = useUpload();
  const { currentJob, startJob, share } = useJobQueue();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = "";
  };

  return (
    <>
      <input id="camera-input" type="file" accept="image/*" capture="environment" className="hidden" onChange={onChange} />
      <input id="library-input" type="file" accept="image/*" className="hidden" onChange={onChange} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button className="action-button bg-gradient-to-br from-blue-500 to-blue-600 text-white" onClick={triggerCamera} disabled={isUploading}>
          <Camera className="h-6 w-6" />
          <span>拍摄商品图</span>
        </button>
        <button className="action-button bg-white text-slate-700 hover:bg-slate-100" onClick={triggerLibrary} disabled={isUploading}>
          <ImagePlus className="h-6 w-6 text-brand-primary" />
          <span>从相册选择</span>
        </button>
        <button
          className="action-button bg-gradient-to-br from-emerald-500 to-emerald-600 text-white disabled:from-slate-400 disabled:to-slate-500"
          onClick={() => startJob("enhance")}
          disabled={!currentJob?.originalStoragePath || isUploading}
        >
          {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
          <span>{isUploading ? "上传中…" : "增强画质"}</span>
        </button>
        <button className="action-button bg-white text-slate-700 hover:bg-slate-100" onClick={share} disabled={!currentJob?.processedImageUrl}>
          <Share2 className="h-6 w-6 text-brand-primary" />
          <span>分享与下载</span>
        </button>
      </div>
    </>
  );
};

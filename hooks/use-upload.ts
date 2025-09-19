"use client";
import { useState } from "react";
import { useJobQueue } from "@/hooks/use-job-queue";

const trigger = (id: string) => {
  const input = document.getElementById(id) as HTMLInputElement | null;
  input?.click();
};

export const useUpload = () => {
  const [isPreparing, setPreparing] = useState(false);
  const { setJob } = useJobQueue();

  const handleFile = async (file: File) => {
    setPreparing(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      setJob({
        id: crypto.randomUUID(),
        state: "pending",
        originalPreviewUrl: previewUrl,
        localFile: file
      });
    } catch (error) {
      console.error(error);
      alert("图片选择失败，请稍后再试");
    } finally {
      setPreparing(false);
    }
  };

  return {
    isPreparing,
    triggerCamera: () => trigger("camera-input"),
    triggerLibrary: () => trigger("library-input"),
    handleFile
  };
};

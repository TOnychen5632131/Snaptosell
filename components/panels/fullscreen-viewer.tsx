"use client";
import { Dialog, DialogPanel } from "@headlessui/react";
import { viewerStore } from "@/lib/ui-state";

export const FullScreenViewer = () => {
  const { imageUrl, isOpen, close } = viewerStore();
  return (
    <Dialog open={isOpen} onClose={close} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative mx-auto max-h-full max-w-4xl overflow-hidden rounded-3xl bg-black p-6">
          <button onClick={close} className="absolute right-6 top-6 text-white/70 hover:text-white">
            关闭
          </button>
          {imageUrl && <img src={imageUrl} alt="放大图" className="max-h-[75vh] w-full object-contain" />}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

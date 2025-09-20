"use client";
import Image from "next/image";
import { Dialog } from "@headlessui/react";
import { viewerStore } from "@/lib/ui-state";

export const FullScreenViewer = () => {
  const { imageUrl, isOpen, close } = viewerStore();
  return (
    <Dialog open={isOpen} onClose={close} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative mx-auto max-h-full max-w-4xl overflow-hidden rounded-3xl bg-black p-6">
          <button onClick={close} className="absolute right-6 top-6 text-white/70 hover:text-white">
            Close
          </button>
          {imageUrl && (
            <Image
              src={imageUrl}
              alt="Enlarged image"
              width={1600}
              height={1600}
              className="max-h-[75vh] w-full object-contain"
              sizes="90vw"
            />
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

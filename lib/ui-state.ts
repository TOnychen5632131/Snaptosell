import { create } from "zustand";

type ViewerState = {
  isOpen: boolean;
  imageUrl?: string;
  open: (url: string) => void;
  close: () => void;
};

export const viewerStore = create<ViewerState>((set) => ({
  isOpen: false,
  imageUrl: undefined,
  open: (url) => set({ isOpen: true, imageUrl: url }),
  close: () => set({ isOpen: false, imageUrl: undefined })
}));

export const openViewer = (url: string) => viewerStore.getState().open(url);

export const settingsStore = create<{ isOpen: boolean; open: () => void; close: () => void }>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false })
}));

export const openSettingsDrawer = () => settingsStore.getState().open();

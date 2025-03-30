import { create } from "zustand";

interface AutoRefreshStore {
  isAutoRefresh: boolean;
  autoRefreshInterval: number;
  setAutoRefresh: (value: boolean) => void;
  setAutoRefreshInterval: (interval: number) => void;
}

export const useAutoRefresh = create<AutoRefreshStore>((set) => ({
  isAutoRefresh: false,
  autoRefreshInterval: 0, // Default: Disabled
  setAutoRefresh: (value) => set({ isAutoRefresh: value }),
  setAutoRefreshInterval: (interval) => set({ autoRefreshInterval: interval }),
}));

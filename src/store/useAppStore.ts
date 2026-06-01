import { create } from 'zustand';

export type AppMode = 'hero' | 'game' | 'visualize' | 'explain';

interface AppState {
  language: string;
  mode: AppMode;
  activeAlgorithm: string | null;
  setLanguage: (lang: string) => void;
  setMode: (mode: AppMode) => void;
  setActiveAlgorithm: (algo: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  mode: 'hero',
  activeAlgorithm: null,
  setLanguage: (language) => set({ language }),
  setMode: (mode) => set({ mode }),
  setActiveAlgorithm: (algo) => set({ activeAlgorithm: algo }),
}));

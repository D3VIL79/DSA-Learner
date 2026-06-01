import { create } from 'zustand';

interface ProgressState {
  xp: number;
  level: number;
  completedAlgorithms: string[];
  totalStepsExecuted: number;
  settings: {
    theme: 'dark' | 'light';
    language: string;
    speed: number;
  };
  addXP: (amount: number) => void;
  completeAlgorithm: (algoId: string) => void;
  incrementSteps: (count?: number) => void;
  updateSettings: (patch: Partial<ProgressState['settings']>) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  resetProgress: () => void;
}

const XP_PER_LEVEL = 100;

function loadSaved(): Partial<ProgressState> {
  try {
    const raw = localStorage.getItem('dsa_quest_progress');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export const useProgressStore = create<ProgressState>((set, get) => {
  const saved = loadSaved();
  return {
    xp: saved.xp ?? 0,
    level: saved.level ?? 1,
    completedAlgorithms: saved.completedAlgorithms ?? [],
    totalStepsExecuted: saved.totalStepsExecuted ?? 0,
    settings: saved.settings ?? { theme: 'dark', language: 'en', speed: 500 },

    addXP: (amount) => {
      const newXP = get().xp + amount;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      set({ xp: newXP, level: newLevel });
      get().saveToLocalStorage();
    },

    completeAlgorithm: (algoId) => {
      const prev = get().completedAlgorithms;
      if (!prev.includes(algoId)) {
        set({ completedAlgorithms: [...prev, algoId] });
        get().addXP(25);
      }
    },

    incrementSteps: (count = 1) => {
      set({ totalStepsExecuted: get().totalStepsExecuted + count });
      // Auto-save every 50 steps
      if (get().totalStepsExecuted % 50 === 0) get().saveToLocalStorage();
    },

    updateSettings: (patch) => {
      set({ settings: { ...get().settings, ...patch } });
      get().saveToLocalStorage();
    },

    saveToLocalStorage: () => {
      try {
        const { xp, level, completedAlgorithms, totalStepsExecuted, settings } = get();
        localStorage.setItem('dsa_quest_progress', JSON.stringify({
          xp, level, completedAlgorithms, totalStepsExecuted, settings
        }));
      } catch {}
    },

    loadFromLocalStorage: () => {
      const saved = loadSaved();
      if (saved.xp !== undefined) set(saved as any);
    },

    resetProgress: () => {
      set({ xp: 0, level: 1, completedAlgorithms: [], totalStepsExecuted: 0 });
      localStorage.removeItem('dsa_quest_progress');
    },
  };
});

import { create } from 'zustand';

interface GameState {
  viewMode: 'third' | 'first';
  isPhoneOpen: boolean;
  gamePhase: 'start' | 'survival' | 'dead';
  setViewMode: (mode: 'third' | 'first') => void;
  togglePhone: () => void;
  setGamePhase: (phase: 'start' | 'survival' | 'dead') => void;
}

export const useGameStore = create<GameState>((set) => ({
  viewMode: 'third',
  isPhoneOpen: false,
  gamePhase: 'start',
  setViewMode: (viewMode) => set({ viewMode }),
  togglePhone: () => set((state) => ({ isPhoneOpen: !state.isPhoneOpen })),
  setGamePhase: (gamePhase) => set({ gamePhase }),
}));

import { create } from 'zustand';

interface GameState {
  heat: number;
  isSpotted: boolean;
  gamePhase: 'start' | 'active' | 'escaped' | 'busted';
  setHeat: (heat: number) => void;
  setSpotted: (spotted: boolean) => void;
  setGamePhase: (phase: 'start' | 'active' | 'escaped' | 'busted') => void;
  increaseHeat: (amount: number) => void;
  decreaseHeat: (amount: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  heat: 0,
  isSpotted: false,
  gamePhase: 'start',
  setHeat: (heat) => set({ heat }),
  setSpotted: (isSpotted) => set({ isSpotted }),
  setGamePhase: (gamePhase) => set({ gamePhase }),
  increaseHeat: (amount) => set((state) => ({ heat: Math.min(100, state.heat + amount) })),
  decreaseHeat: (amount) => set((state) => ({ heat: Math.max(0, state.heat - amount) })),
}));

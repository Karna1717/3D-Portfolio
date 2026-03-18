import { create } from 'zustand'

export const useStore = create((set) => ({
  activeNode: null,
  setActiveNode: (id) => set({ activeNode: id }),
  universe: 'default', // 'default' | 'cyberpunk'
  setUniverse: (mode) => set({ universe: mode }),
  sound: true,
  toggleSound: () => set((state) => ({ sound: !state.sound })),
  gameMode: false,
  setGameMode: (active) => set({ gameMode: active }),
  score: 0,
  setScore: (score) => set({ score }),
  incrementScore: () => set((state) => ({ score: state.score + 100 })),
  difficulty: 1, // 0: Easy, 1: Medium, 2: Hard
  setDifficulty: (val) => set({ difficulty: val }),
}))

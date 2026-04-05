import { create } from 'zustand'
import { UserProfile, getLevelFromXp } from '@/types/game'

interface LevelUpEvent {
  oldLevel: number
  newLevel: number
  newTitle: string
}

interface UserStore {
  user: UserProfile | null
  levelUpEvent: LevelUpEvent | null
  setUser: (user: UserProfile | null) => void
  addXp: (amount: number) => void
  clearLevelUp: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  levelUpEvent: null,

  setUser: (user) => set({ user }),

  addXp: (amount) => set((state) => {
    if (!state.user) return state
    const oldLevel = getLevelFromXp(state.user.xp_total).level
    const newXp = state.user.xp_total + amount
    const newLevelData = getLevelFromXp(newXp)
    const didLevelUp = newLevelData.level > oldLevel
    return {
      user: { ...state.user, xp_total: newXp },
      levelUpEvent: didLevelUp
        ? { oldLevel, newLevel: newLevelData.level, newTitle: newLevelData.title }
        : state.levelUpEvent,
    }
  }),

  clearLevelUp: () => set({ levelUpEvent: null }),
}))

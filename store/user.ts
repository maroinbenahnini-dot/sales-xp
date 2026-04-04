import { create } from 'zustand'
import { UserProfile } from '@/types/game'

interface UserStore {
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
  addXp: (amount: number) => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  addXp: (amount) => set((state) => {
    if (!state.user) return state
    return { user: { ...state.user, xp_total: state.user.xp_total + amount } }
  }),
}))

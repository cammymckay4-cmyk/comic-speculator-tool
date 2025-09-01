import { create } from 'zustand'

interface NavbarUserType {
  name: string
  email: string
  avatar?: string | null
}

interface UserStore {
  user: NavbarUserType | null
  isLoading: boolean
  setUser: (user: NavbarUserType | null) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setLoading: (isLoading) => set({ isLoading }),
}))
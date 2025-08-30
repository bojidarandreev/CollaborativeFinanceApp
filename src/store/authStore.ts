import { create } from 'zustand'
import { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  setInitialized: (isInitialized: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isInitialized: false,
  setSession: (session) => set({ session }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  reset: () => set({ session: null, isInitialized: false }),
}))

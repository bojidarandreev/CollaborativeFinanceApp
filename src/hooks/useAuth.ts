import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from '../store/authStore'
import { SigninWithPassword, Signup } from '../types'; // I'll need to create this types file

export const useAuth = () => {
  const { session, setSession, isInitialized, setInitialized } = useAuthStore()

  useEffect(() => {
    // Check for an existing session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setInitialized(true)
    })

    // Listen for changes in auth state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    // Cleanup listener on unmount
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [setSession])

  const signUp = async (credentials: Signup) => {
    return supabase.auth.signUp(credentials)
  }

  const signIn = async (credentials: SigninWithPassword) => {
    return supabase.auth.signInWithPassword(credentials)
  }

  const signOut = async () => {
    return supabase.auth.signOut()
  }

  return {
    session,
    user: session?.user,
    signUp,
    signIn,
    signOut,
  }
}

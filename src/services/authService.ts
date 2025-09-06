import { supabase } from '@/lib/supabaseClient'
import type { AuthResponse, AuthError } from '@supabase/supabase-js'

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData extends LoginCredentials {
  name: string
}

export interface AuthResult {
  success: boolean
  user?: {
    id: string
    email: string
    name: string
    avatar?: string | null
  }
  error?: string
}

export const signIn = async (credentials: LoginCredentials): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    if (data.user) {
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          avatar: data.user.user_metadata?.avatar_url || null,
        },
      }
    }

    return {
      success: false,
      error: 'No user data returned',
    }
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred during sign in',
    }
  }
}

export const signUp = async (signupData: SignupData): Promise<AuthResult> => {
  try {
    const emailRedirectTo = `${window.location.origin}/auth/confirm?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
    
    console.log('[AUTH] SignUp function called')
    console.log('[AUTH] Signup data:', { email: signupData.email, name: signupData.name })
    console.log('[AUTH] Current location:', window.location.pathname + window.location.search)
    console.log('[AUTH] Email redirect URL:', emailRedirectTo)
    
    const { data, error } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        data: {
          full_name: signupData.name,
        },
        emailRedirectTo,
      },
    })
    
    console.log('[AUTH] Supabase signUp response:', { data: data?.user ? 'User object present' : 'No user', error: error?.message })
    console.log('[AUTH] Actual confirmation URL that will be in email:', emailRedirectTo)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    if (data.user) {
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          name: signupData.name,
          avatar: data.user.user_metadata?.avatar_url || null,
        },
      }
    }

    return {
      success: false,
      error: 'No user data returned',
    }
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred during sign up',
    }
  }
}

export const signOut = async (): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred during sign out',
    }
  }
}

export const resetPassword = async (email: string): Promise<AuthResult> => {
  try {
    if (!email || !email.trim()) {
      return {
        success: false,
        error: 'Email is required',
      }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred during password reset',
    }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}
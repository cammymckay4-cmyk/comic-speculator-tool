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
    
    console.log('[SIGNUP] Attempting emailRedirectTo:', emailRedirectTo)
    console.log('[SIGNUP] Full signup options:', { 
      email: signupData.email, 
      password: signupData.password,
      options: {
        data: {
          full_name: signupData.name,
        },
        emailRedirectTo,
      }
    })
    
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
    
    console.log('[SIGNUP] Signup response:', data)

    if (error) {
      // Enhanced check for user already existing with more error patterns
      const errorMsg = error.message?.toLowerCase() || ''
      if (errorMsg.includes('already registered') || 
          errorMsg.includes('email already exists') ||
          errorMsg.includes('user already exists') ||
          errorMsg.includes('already been registered') ||
          errorMsg.includes('duplicate key value') ||
          errorMsg.includes('email address is already registered') ||
          errorMsg.includes('user with this email already exists') ||
          error.message === 'User already registered') {
        return {
          success: false,
          error: 'This email is already registered. Please sign in instead.',
        }
      }
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
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '@/lib/supabaseClient'
import {
  signIn,
  signUp,
  signOut,
  resetPassword,
  getCurrentUser,
  type LoginCredentials,
  type SignupData
} from './authService'

// Mock auth responses
const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg'
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-15T10:00:00Z',
  phone: null,
  phone_confirmed_at: null,
  email_confirmed_at: '2024-01-15T10:00:00Z',
  confirmed_at: '2024-01-15T10:00:00Z',
  last_sign_in_at: '2024-01-15T10:00:00Z',
  role: 'authenticated',
  updated_at: '2024-01-15T10:00:00Z',
  is_anonymous: false
}

const mockAuthResponse = {
  data: {
    user: mockUser,
    session: {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
    }
  },
  error: null
}

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockAuthResponse)

      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = await signIn(credentials)

      expect(result.success).toBe(true)
      expect(result.user?.id).toBe(mockUser.id)
      expect(result.user?.email).toBe(mockUser.email)
      expect(result.user?.name).toBe('Test User')
      expect(result.user?.avatar).toBe('https://example.com/avatar.jpg')
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should handle sign in errors', async () => {
      const mockError = { 
        message: 'Invalid login credentials',
        code: 'invalid_credentials',
        status: 400,
        __isAuthError: true,
        name: 'AuthError'
      }
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      })

      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      const result = await signIn(credentials)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid login credentials')
      expect(result.user).toBeUndefined()
    })

    it('should handle missing user data', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: null
      })

      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = await signIn(credentials)

      expect(result.success).toBe(false)
      expect(result.error).toBe('No user data returned')
    })

    it('should handle unexpected errors', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(new Error('Network error'))

      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = await signIn(credentials)

      expect(result.success).toBe(false)
      expect(result.error).toBe('An unexpected error occurred during sign in')
    })

    it('should use email prefix as name when full_name is not available', async () => {
      const userWithoutName = {
        ...mockUser,
        email: 'johndoe@example.com',
        user_metadata: {}
      }
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: userWithoutName, session: {} as any },
        error: null
      })

      const credentials: LoginCredentials = {
        email: 'johndoe@example.com',
        password: 'password123'
      }

      const result = await signIn(credentials)

      expect(result.success).toBe(true)
      expect(result.user?.name).toBe('johndoe')
    })
  })

  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue(mockAuthResponse)

      const signupData: SignupData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }

      const result = await signUp(signupData)

      expect(result.success).toBe(true)
      expect(result.user?.id).toBe(mockUser.id)
      expect(result.user?.email).toBe(mockUser.email)
      expect(result.user?.name).toBe('Test User')
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
          },
          emailRedirectTo: 'http://localhost:3000/auth/confirm',
        },
      })
    })

    it('should handle sign up errors', async () => {
      const mockError = {
        message: 'User already registered',
        code: 'user_already_registered',
        status: 422,
        __isAuthError: true,
        name: 'AuthError'
      }
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      })

      const signupData: SignupData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User'
      }

      const result = await signUp(signupData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('User already registered')
      expect(result.user).toBeUndefined()
    })

    it('should handle missing user data', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: null
      })

      const signupData: SignupData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }

      const result = await signUp(signupData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('No user data returned')
    })

    it('should handle unexpected errors', async () => {
      vi.mocked(supabase.auth.signUp).mockRejectedValue(new Error('Network error'))

      const signupData: SignupData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }

      const result = await signUp(signupData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('An unexpected error occurred during sign up')
    })
  })

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

      const result = await signOut()

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      const mockError = {
        message: 'Sign out failed',
        code: 'signout_error',
        status: 500,
        __isAuthError: true,
        name: 'AuthError'
      }
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: mockError })

      const result = await signOut()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Sign out failed')
    })

    it('should handle unexpected errors', async () => {
      vi.mocked(supabase.auth.signOut).mockRejectedValue(new Error('Network error'))

      const result = await signOut()

      expect(result.success).toBe(false)
      expect(result.error).toBe('An unexpected error occurred during sign out')
    })
  })

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ 
        data: {},
        error: null 
      })

      const result = await resetPassword('test@example.com')

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com')
    })

    it('should handle reset password errors', async () => {
      const mockError = {
        message: 'Email not found',
        code: 'email_not_found',
        status: 404,
        __isAuthError: true,
        name: 'AuthError'
      }
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ 
        data: {},
        error: mockError 
      })

      const result = await resetPassword('nonexistent@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email not found')
    })

    it('should handle empty email', async () => {
      const result = await resetPassword('')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email is required')
      expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled()
    })

    it('should handle whitespace-only email', async () => {
      const result = await resetPassword('   ')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email is required')
      expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled()
    })

    it('should handle unexpected errors', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockRejectedValue(new Error('Network error'))

      const result = await resetPassword('test@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('An unexpected error occurred during password reset')
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await getCurrentUser()

      expect(result).toEqual(mockUser)
      expect(supabase.auth.getUser).toHaveBeenCalled()
    })

    it('should handle get user errors', async () => {
      const mockError = {
        message: 'User not authenticated',
        code: 'unauthenticated',
        status: 401,
        __isAuthError: true,
        name: 'AuthError'
      }
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: mockError
      })

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })

    it('should handle unexpected errors', async () => {
      vi.mocked(supabase.auth.getUser).mockRejectedValue(new Error('Network error'))
      
      // Mock console.error to avoid test output pollution
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await getCurrentUser()

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Error getting current user:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('should return null when no user data', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null
      })

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })
  })
})
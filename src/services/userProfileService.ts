import { supabase } from '@/lib/supabaseClient'
import type { UserProfile, UpdateProfileData } from '@/lib/types'

export class UserProfileService {
  
  /**
   * Fetch a single user profile by username (public data only)
   * This is safe to use as it only exposes public profile information
   */
  async fetchUserProfile(username: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatarUrl, bio, createdAt, updatedAt')
        .eq('username', username)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // User not found
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw new Error('Failed to fetch user profile')
    }
  }

  /**
   * Fetch the current user's own profile
   * Uses RLS to ensure users can only see their own full profile data
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatarUrl, bio, createdAt, updatedAt')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found, this shouldn't happen if trigger is working
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching current user profile:', error)
      throw new Error('Failed to fetch user profile')
    }
  }

  /**
   * Update the current user's profile
   * RLS ensures users can only update their own profile
   */
  async updateUserProfile(updates: UpdateProfileData): Promise<UserProfile> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Validate username if being updated
      if (updates.username) {
        if (updates.username.length < 3 || updates.username.length > 30) {
          throw new Error('Username must be between 3 and 30 characters')
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(updates.username)) {
          throw new Error('Username can only contain letters, numbers, and underscores')
        }
      }

      // Validate bio length if being updated
      if (updates.bio && updates.bio.length > 500) {
        throw new Error('Bio must be 500 characters or less')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('id', user.id)
        .select('id, username, avatarUrl, bio, createdAt, updatedAt')
        .single()

      if (error) {
        // Handle unique constraint violation for username
        if (error.code === '23505' && error.message.includes('username')) {
          throw new Error('Username is already taken')
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to update user profile')
    }
  }

  /**
   * Check if a username is available
   * Public endpoint that only checks username availability
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      // Validate username format first
      if (username.length < 3 || username.length > 30) {
        return false
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return false
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .limit(1)

      if (error) {
        throw error
      }

      return data.length === 0
    } catch (error) {
      console.error('Error checking username availability:', error)
      throw new Error('Failed to check username availability')
    }
  }

  /**
   * Search for user profiles by username pattern (public data only)
   * Limited to prevent abuse and only returns public information
   */
  async searchProfiles(query: string, limit: number = 10): Promise<UserProfile[]> {
    try {
      if (query.length < 3) {
        return []
      }

      // Limit the number of results to prevent abuse
      const searchLimit = Math.min(limit, 20)

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatarUrl, bio, createdAt, updatedAt')
        .ilike('username', `%${query}%`)
        .limit(searchLimit)
        .order('createdAt', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error searching profiles:', error)
      throw new Error('Failed to search profiles')
    }
  }
}

// Create and export a singleton instance
export const userProfileService = new UserProfileService()
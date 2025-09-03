import { supabase } from '../lib/supabaseClient'

export type UserRole = 'user' | 'moderator' | 'admin'

export interface AdminUser {
  id: string
  email: string
  username: string
  role: UserRole
  createdAt: string
  lastSignInAt?: string
}

export class AdminService {
  
  /**
   * Check if a user has a specific role
   * This function checks the role column in the profiles table
   */
  async checkUserRole(userId: string): Promise<UserRole | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error checking user role:', error)
        return null
      }

      return data?.role || 'user' // Default to 'user' if no role is set
    } catch (error) {
      console.error('Error in checkUserRole:', error)
      return null
    }
  }

  /**
   * Get the current user's role
   */
  async getCurrentUserRole(): Promise<UserRole | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return null
      }

      return this.checkUserRole(user.id)
    } catch (error) {
      console.error('Error getting current user role:', error)
      return null
    }
  }

  /**
   * Check if the current user is an admin
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    const role = await this.getCurrentUserRole()
    return role === 'admin'
  }

  /**
   * List all users (admin only)
   * This calls the secure admin-ops Edge Function
   */
  async listAllUsers(): Promise<AdminUser[]> {
    try {
      // Call the secure admin-ops Edge Function
      const { data, error } = await supabase.functions.invoke('admin-ops/list-users', {
        method: 'GET'
      })
      
      if (error) {
        throw error
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      return data?.users || []
    } catch (error) {
      console.error('Error listing users:', error)
      throw new Error('Failed to list users')
    }
  }

  /**
   * Update a user's role (admin only)
   * This calls the secure admin-ops Edge Function
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    try {
      // Call the secure admin-ops Edge Function
      const { data, error } = await supabase.functions.invoke('admin-ops/update-role', {
        method: 'POST',
        body: { userId, newRole }
      })
      
      if (error) {
        throw error
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      if (!data?.success) {
        throw new Error('Failed to update user role')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      throw new Error('Failed to update user role')
    }
  }
}

// Create and export a singleton instance
export const adminService = new AdminService()
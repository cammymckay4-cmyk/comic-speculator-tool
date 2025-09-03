import { supabase } from '../lib/supabaseClient'

export type UserRole = 'user' | 'moderator' | 'admin'

export interface AdminUser {
  id: string
  email: string
  username: string
  role: UserRole
  created_at: string
  last_sign_in_at?: string
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
   * This uses the admin client to get all users and combines with profile data
   */
  async listAllUsers(): Promise<AdminUser[]> {
    try {
      // First check if current user is admin
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required')
      }

      // Get all users from auth.users using admin client
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        throw authError
      }

      // Get profile data for all users including roles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, role')

      if (profileError) {
        throw profileError
      }

      // Combine auth data with profile data
      const users: AdminUser[] = authUsers.users.map(user => {
        const profile = profiles?.find(p => p.id === user.id)
        return {
          id: user.id,
          email: user.email || '',
          username: profile?.username || 'Unknown',
          role: profile?.role || 'user',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at
        }
      })

      return users
    } catch (error) {
      console.error('Error listing users:', error)
      throw new Error('Failed to list users')
    }
  }

  /**
   * Update a user's role (admin only)
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    try {
      // First check if current user is admin
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required')
      }

      // Validate role
      if (!['user', 'moderator', 'admin'].includes(newRole)) {
        throw new Error('Invalid role specified')
      }

      // Update the role in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      throw new Error('Failed to update user role')
    }
  }
}

// Create and export a singleton instance
export const adminService = new AdminService()
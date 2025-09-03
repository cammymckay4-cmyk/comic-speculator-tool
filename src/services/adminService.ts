import { supabase } from '@/lib/supabaseClient'
import type { UserProfile } from '@/lib/types'

export interface AdminUser extends UserProfile {
  role: string;
  email?: string;
  last_sign_in_at?: string | null;
  created_at: string;
}

export interface UpdateUserRoleData {
  userId: string;
  role: string;
}

export class AdminService {
  
  /**
   * Check if the current user has admin privileges
   * This should be called before any admin operations
   */
  async checkUserRole(userId?: string): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return null
      }

      const targetUserId = userId || user.id

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', targetUserId)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        return null
      }

      return data?.role || 'user'
    } catch (error) {
      console.error('Error checking user role:', error)
      return null
    }
  }

  /**
   * Check if the current user is an admin
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    const role = await this.checkUserRole()
    return role === 'admin'
  }

  /**
   * Fetch all users - only available to admin users
   * Uses Supabase auth admin functions for security
   */
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      // First verify admin permissions
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        throw new Error('Insufficient permissions: Admin access required')
      }

      // Get all users from auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        throw authError
      }

      if (!authUsers.users || authUsers.users.length === 0) {
        return []
      }

      // Get user IDs
      const userIds = authUsers.users.map(user => user.id)

      // Fetch corresponding profiles with roles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio, role, created_at, updated_at')
        .in('id', userIds)

      if (profileError) {
        throw profileError
      }

      // Combine auth data with profile data
      const adminUsers: AdminUser[] = authUsers.users.map(authUser => {
        const profile = profiles?.find(p => p.id === authUser.id)
        
        return {
          id: authUser.id,
          username: profile?.username || authUser.email?.split('@')[0] || 'Unknown',
          avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || null,
          bio: profile?.bio || null,
          role: profile?.role || 'user',
          email: authUser.email || undefined,
          last_sign_in_at: authUser.last_sign_in_at,
          created_at: profile?.created_at || authUser.created_at,
          updated_at: profile?.updated_at || authUser.updated_at
        }
      })

      return adminUsers
    } catch (error) {
      console.error('Error fetching all users:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to fetch users')
    }
  }

  /**
   * Update a user's role - only available to admin users
   */
  async updateUserRole(data: UpdateUserRoleData): Promise<void> {
    try {
      // First verify admin permissions
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        throw new Error('Insufficient permissions: Admin access required')
      }

      // Validate role
      const validRoles = ['user', 'moderator', 'admin']
      if (!validRoles.includes(data.role)) {
        throw new Error('Invalid role. Must be one of: user, moderator, admin')
      }

      // Prevent admin from demoting themselves
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser && currentUser.id === data.userId && data.role !== 'admin') {
        throw new Error('Cannot modify your own admin privileges')
      }

      // Update the user's role
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: data.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.userId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to update user role')
    }
  }

  /**
   * Get user statistics for admin dashboard
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    adminCount: number;
    moderatorCount: number;
    regularUsers: number;
    recentSignups: number;
  }> {
    try {
      // First verify admin permissions
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        throw new Error('Insufficient permissions: Admin access required')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role, created_at')

      if (error) {
        throw error
      }

      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const stats = {
        totalUsers: data.length,
        adminCount: data.filter(user => user.role === 'admin').length,
        moderatorCount: data.filter(user => user.role === 'moderator').length,
        regularUsers: data.filter(user => !user.role || user.role === 'user').length,
        recentSignups: data.filter(user => new Date(user.created_at) >= sevenDaysAgo).length
      }

      return stats
    } catch (error) {
      console.error('Error fetching user stats:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to fetch user statistics')
    }
  }
}

// Create and export a singleton instance
export const adminService = new AdminService()
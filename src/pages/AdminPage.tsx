import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Shield, 
  UserCheck, 
  Mail, 
  Calendar,
  ChevronDown,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react'
import { adminService, type AdminUser } from '@/services/adminService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'sonner'

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<string>('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    totalUsers: number;
    adminCount: number;
    moderatorCount: number;
    regularUsers: number;
    recentSignups: number;
  } | null>(null)

  const roles = [
    { value: 'user', label: 'User', color: 'bg-gray-100 text-gray-800' },
    { value: 'moderator', label: 'Moderator', color: 'bg-blue-100 text-blue-800' },
    { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [usersData, statsData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getUserStats()
      ])
      
      setUsers(usersData)
      setStats(statsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load admin data'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEditRole = (userId: string, currentRole: string) => {
    setEditingUser(userId)
    setEditingRole(currentRole)
  }

  const handleSaveRole = async (userId: string) => {
    if (!editingRole) return

    try {
      setUpdating(userId)
      await adminService.updateUserRole({ userId, role: editingRole })
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: editingRole } : user
        )
      )

      // Update stats
      await adminService.getUserStats().then(setStats)
      
      toast.success(`User role updated to ${editingRole}`)
      setEditingUser(null)
      setEditingRole('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user role'
      toast.error(errorMessage)
    } finally {
      setUpdating(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditingRole('')
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short', 
        year: 'numeric'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const getRoleConfig = (role: string) => {
    return roles.find(r => r.value === role) || roles[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment">
        <div className="bg-gradient-to-br from-stan-lee-blue to-kirby-red py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-super-squad text-4xl md:text-5xl text-parchment">
              ADMIN PANEL
            </h1>
            <p className="font-persona-aura text-parchment opacity-90 mt-2">
              User Management & System Administration
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading admin data..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-parchment">
        <div className="bg-gradient-to-br from-stan-lee-blue to-kirby-red py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-super-squad text-4xl md:text-5xl text-parchment">
              ADMIN PANEL
            </h1>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-2 border-red-200 p-6 comic-border">
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-red-600" size={24} />
              <div>
                <h3 className="font-super-squad text-red-900">Access Error</h3>
                <p className="font-persona-aura text-red-700">{error}</p>
                <button 
                  onClick={loadData}
                  className="mt-4 comic-button text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-stan-lee-blue to-kirby-red py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-super-squad text-4xl md:text-5xl text-parchment">
            ADMIN PANEL
          </h1>
          <p className="font-persona-aura text-parchment opacity-90 mt-2">
            User Management & System Administration
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white comic-border shadow-comic p-6">
              <div className="flex items-center">
                <Users className="text-stan-lee-blue" size={24} />
                <div className="ml-4">
                  <p className="font-persona-aura text-sm text-gray-600">Total Users</p>
                  <p className="font-super-squad text-2xl text-ink-black">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white comic-border shadow-comic p-6">
              <div className="flex items-center">
                <Shield className="text-red-600" size={24} />
                <div className="ml-4">
                  <p className="font-persona-aura text-sm text-gray-600">Admins</p>
                  <p className="font-super-squad text-2xl text-ink-black">{stats.adminCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white comic-border shadow-comic p-6">
              <div className="flex items-center">
                <Settings className="text-blue-600" size={24} />
                <div className="ml-4">
                  <p className="font-persona-aura text-sm text-gray-600">Moderators</p>
                  <p className="font-super-squad text-2xl text-ink-black">{stats.moderatorCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white comic-border shadow-comic p-6">
              <div className="flex items-center">
                <UserCheck className="text-green-600" size={24} />
                <div className="ml-4">
                  <p className="font-persona-aura text-sm text-gray-600">Regular Users</p>
                  <p className="font-super-squad text-2xl text-ink-black">{stats.regularUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white comic-border shadow-comic p-6">
              <div className="flex items-center">
                <Calendar className="text-golden-age-yellow" size={24} />
                <div className="ml-4">
                  <p className="font-persona-aura text-sm text-gray-600">Recent (7d)</p>
                  <p className="font-super-squad text-2xl text-ink-black">{stats.recentSignups}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Table */}
        <div className="bg-white comic-border shadow-comic">
          <div className="px-6 py-4 border-b-2 border-gray-200">
            <h2 className="font-super-squad text-2xl text-ink-black">
              USER MANAGEMENT
            </h2>
            <p className="font-persona-aura text-gray-600 mt-1">
              Manage user roles and permissions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-persona-aura font-semibold text-xs text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left font-persona-aura font-semibold text-xs text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left font-persona-aura font-semibold text-xs text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left font-persona-aura font-semibold text-xs text-gray-600 uppercase tracking-wider">
                    Last Sign In
                  </th>
                  <th className="px-6 py-3 text-left font-persona-aura font-semibold text-xs text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar_url ? (
                            <img
                              className="h-10 w-10 rounded-full border-2 border-gray-200"
                              src={user.avatar_url}
                              alt={user.username}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-golden-age-yellow flex items-center justify-center border-2 border-gray-200">
                              <span className="font-super-squad text-ink-black text-sm">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="font-persona-aura font-semibold text-ink-black">
                            {user.username}
                          </div>
                          <div className="font-persona-aura text-xs text-gray-500">
                            Joined {formatDate(user.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-900">
                        <Mail size={14} className="text-gray-400 mr-2" />
                        <span className="font-persona-aura text-sm">
                          {user.email || 'No email'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value)}
                            className="comic-input text-sm py-1 px-2 min-w-[120px]"
                          >
                            {roles.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-persona-aura font-semibold rounded-full ${getRoleConfig(user.role).color}`}>
                          {getRoleConfig(user.role).label}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap font-persona-aura text-sm text-gray-900">
                      {formatDate(user.last_sign_in_at)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingUser === user.id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSaveRole(user.id)}
                            disabled={updating === user.id}
                            className="text-green-600 hover:text-green-800 disabled:opacity-50"
                          >
                            {updating === user.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <Save size={16} />
                            )}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditRole(user.id, user.role)}
                          className="text-stan-lee-blue hover:text-blue-800 font-persona-aura font-semibold"
                        >
                          Edit Role
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 font-persona-aura font-semibold text-gray-900">
                No users found
              </h3>
              <p className="mt-1 font-persona-aura text-gray-500">
                There are no users to display.
              </p>
            </div>
          )}
        </div>

        {/* Warning Notice */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 p-6 comic-border">
          <div className="flex items-start space-x-3">
            <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-persona-aura font-semibold text-yellow-900">
                Important Security Notice
              </h3>
              <p className="font-persona-aura text-sm text-yellow-700 mt-1">
                • Admin privileges allow full access to all system functions and user data
              </p>
              <p className="font-persona-aura text-sm text-yellow-700">
                • Moderator privileges allow limited administrative functions
              </p>
              <p className="font-persona-aura text-sm text-yellow-700">
                • You cannot modify your own admin privileges for security
              </p>
              <p className="font-persona-aura text-sm text-yellow-700">
                • All role changes are logged for security auditing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
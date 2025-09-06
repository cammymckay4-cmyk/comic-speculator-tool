import React, { useState } from 'react'
import { 
  Bell, 
  Plus, 
  Edit2, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  TrendingDown,
  TrendingUp,
  Package,
  Clock,
  DollarSign,
  AlertCircle,
  LogIn
} from 'lucide-react'
import { useAlertsQuery, useUpdateAlertStatus, useDeleteAlert } from '@/hooks/useAlertsQuery'
import CreateAlertModal from '@/components/features/CreateAlertModal'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from '@/store/toastStore'
import { formatDistanceToNow } from 'date-fns'
import { useUserStore } from '@/store/userStore'
import { useNavigate } from 'react-router-dom'

// Helper function to format alert criteria display
const formatAlertCriteria = (alert: any) => {
  if (alert.criteria?.priceThreshold && alert.criteria?.priceDirection) {
    return `${alert.criteria.priceDirection === 'above' ? 'Above' : 'Below'} £${alert.criteria.priceThreshold.toFixed(2)}`
  }
  
  switch (alert.type) {
    case 'new-issue':
      return 'New issue available'
    case 'availability':
      return 'Available in collection'
    case 'auction-ending':
      return 'Auction ending soon'
    case 'market-trend':
      return 'Market trend change'
    case 'news-mention':
      return 'News mention detected'
    default:
      return 'Alert condition'
  }
}

// Helper function to format last triggered display
const formatLastTriggered = (lastTriggered?: string) => {
  if (!lastTriggered) return 'Never'
  
  try {
    const date = new Date(lastTriggered)
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return 'Unknown'
  }
}

const alertTypeConfig = {
  'price-drop': { icon: TrendingDown, color: 'text-green-600', bg: 'bg-green-100' },
  'price-increase': { icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-100' },
  'new-issue': { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
  'availability': { icon: Bell, color: 'text-purple-600', bg: 'bg-purple-100' },
  'auction-ending': { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
  'market-trend': { icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  'news-mention': { icon: Bell, color: 'text-pink-600', bg: 'bg-pink-100' },
}

const AlertsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean
    alertId: string
    alertName: string
    isBulk: boolean
  }>({
    isOpen: false,
    alertId: '',
    alertName: '',
    isBulk: false
  })
  
  const { data: alerts = [], isLoading, isError, error } = useAlertsQuery()
  const updateAlertStatusMutation = useUpdateAlertStatus()
  const deleteAlertMutation = useDeleteAlert()

  const toggleAlertStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateAlertStatusMutation.mutateAsync({ alertId: id, isActive: !currentStatus })
    } catch (error) {
      console.error('Failed to update alert status:', error)
    }
  }

  const handleDeleteAlert = (id: string, alertName: string) => {
    // Handle case where alert name might be null/undefined
    const displayName = alertName || 'Unnamed Alert'
    
    setDeleteConfirmModal({
      isOpen: true,
      alertId: id,
      alertName: displayName,
      isBulk: false
    })
  }

  const executeDeleteAlert = async () => {
    const { alertId, alertName } = deleteConfirmModal
    
    try {
      await deleteAlertMutation.mutateAsync(alertId)
      
      // Show success toast
      toast.success(
        'Alert deleted successfully',
        `"${alertName}" has been removed from your alerts`
      )
      
      // Remove from selected alerts
      setSelectedAlerts(prev => prev.filter(alertIdToRemove => alertIdToRemove !== alertId))
      
      // Close modal
      setDeleteConfirmModal({ isOpen: false, alertId: '', alertName: '', isBulk: false })
    } catch (error) {
      console.error('Failed to delete alert:', error)
      
      // Show error toast
      toast.error(
        'Failed to delete alert',
        error instanceof Error ? error.message : 'An unknown error occurred'
      )
      
      // Close modal
      setDeleteConfirmModal({ isOpen: false, alertId: '', alertName: '', isBulk: false })
    }
  }

  const handleBulkActivate = async () => {
    if (selectedAlerts.length === 0) return
    
    try {
      // Process all selected alerts
      const promises = selectedAlerts.map(alertId => 
        updateAlertStatusMutation.mutateAsync({ alertId, isActive: true })
      )
      
      await Promise.all(promises)
      
      // Show success toast
      toast.success(
        'Alerts activated',
        `${selectedAlerts.length} alert(s) have been activated`
      )
      
      // Clear selections
      setSelectedAlerts([])
    } catch (error) {
      console.error('Failed to activate alerts:', error)
      
      // Show error toast
      toast.error(
        'Failed to activate alerts',
        error instanceof Error ? error.message : 'Some alerts could not be activated'
      )
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedAlerts.length === 0) return
    
    try {
      // Process all selected alerts
      const promises = selectedAlerts.map(alertId => 
        updateAlertStatusMutation.mutateAsync({ alertId, isActive: false })
      )
      
      await Promise.all(promises)
      
      // Show success toast
      toast.success(
        'Alerts deactivated',
        `${selectedAlerts.length} alert(s) have been deactivated`
      )
      
      // Clear selections
      setSelectedAlerts([])
    } catch (error) {
      console.error('Failed to deactivate alerts:', error)
      
      // Show error toast
      toast.error(
        'Failed to deactivate alerts',
        error instanceof Error ? error.message : 'Some alerts could not be deactivated'
      )
    }
  }

  const handleBulkDelete = () => {
    if (selectedAlerts.length === 0) return
    
    const selectedAlertNames = alerts
      .filter(alert => selectedAlerts.includes(alert.id))
      .map(alert => alert.name || 'Unnamed Alert')
      .join(', ')
    
    setDeleteConfirmModal({
      isOpen: true,
      alertId: '', // Not used for bulk delete
      alertName: selectedAlertNames,
      isBulk: true
    })
  }

  const executeBulkDelete = async () => {
    try {
      // Process all selected alerts
      const promises = selectedAlerts.map(alertId => 
        deleteAlertMutation.mutateAsync(alertId)
      )
      
      await Promise.all(promises)
      
      // Show success toast
      toast.success(
        'Alerts deleted successfully',
        `${selectedAlerts.length} alert(s) have been removed from your alerts`
      )
      
      // Clear selections and close modal
      setSelectedAlerts([])
      setDeleteConfirmModal({ isOpen: false, alertId: '', alertName: '', isBulk: false })
    } catch (error) {
      console.error('Failed to delete alerts:', error)
      
      // Show error toast
      toast.error(
        'Failed to delete alerts',
        error instanceof Error ? error.message : 'Some alerts could not be deleted'
      )
      
      // Close modal
      setDeleteConfirmModal({ isOpen: false, alertId: '', alertName: '', isBulk: false })
    }
  }

  const toggleSelectAlert = (id: string) => {
    if (selectedAlerts.includes(id)) {
      setSelectedAlerts(selectedAlerts.filter(alertId => alertId !== id))
    } else {
      setSelectedAlerts([...selectedAlerts, id])
    }
  }

  const selectAllAlerts = () => {
    if (selectedAlerts.length === alerts.length) {
      setSelectedAlerts([])
    } else {
      setSelectedAlerts(alerts.map(alert => alert.id))
    }
  }

  // Show login prompt if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <div className="bg-white comic-border shadow-comic p-8 max-w-md text-center">
          <h2 className="font-super-squad text-2xl text-stan-lee-blue mb-4">Login Required</h2>
          <p className="font-persona-aura text-ink-black mb-6">
            You need to be logged in to manage your price alerts.
          </p>
          <button 
            onClick={() => navigate('/auth?redirect=/alerts')}
            className="comic-button flex items-center space-x-2 mx-auto"
          >
            <LogIn size={18} />
            <span>Login to Continue</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-stan-lee-blue to-kirby-red py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-super-squad text-4xl md:text-5xl text-parchment mb-2">
                PRICE ALERTS
              </h1>
              <p className="font-persona-aura text-parchment opacity-90">
                Never miss a deal with smart price monitoring
              </p>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="comic-button flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Create Alert</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b-comic border-ink-black shadow-comic">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="font-super-squad text-2xl text-ink-black">{isLoading ? '...' : alerts.length}</p>
              <p className="font-persona-aura text-sm text-gray-600">Total Alerts</p>
            </div>
            <div className="text-center">
              <p className="font-super-squad text-2xl text-green-600">
                {isLoading ? '...' : alerts.filter(a => a.isActive).length}
              </p>
              <p className="font-persona-aura text-sm text-gray-600">Active</p>
            </div>
            <div className="text-center">
              <p className="font-super-squad text-2xl text-kirby-red">
                {isLoading ? '...' : alerts.filter(a => {
                  if (!a.lastTriggered) return false
                  try {
                    const lastTriggered = new Date(a.lastTriggered)
                    const now = new Date()
                    const hoursAgo = (now.getTime() - lastTriggered.getTime()) / (1000 * 60 * 60)
                    return hoursAgo <= 24
                  } catch {
                    return false
                  }
                }).length}
              </p>
              <p className="font-persona-aura text-sm text-gray-600">Triggered Today</p>
            </div>
            <div className="text-center">
              <p className="font-super-squad text-2xl text-golden-age-yellow">
                {isLoading ? '...' : alerts.reduce((sum, a) => sum + a.triggerCount, 0)}
              </p>
              <p className="font-persona-aura text-sm text-gray-600">Total Triggers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white comic-border shadow-comic overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stan-lee-blue">
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedAlerts.length === alerts.length}
                      onChange={selectAllAlerts}
                      className="w-4 h-4 border-2 border-parchment"
                    />
                  </th>
                  <th className="p-4 text-left font-super-squad text-parchment uppercase">
                    Alert Name
                  </th>
                  <th className="p-4 text-left font-super-squad text-parchment uppercase">
                    Type
                  </th>
                  <th className="p-4 text-left font-super-squad text-parchment uppercase">
                    Comic
                  </th>
                  <th className="p-4 text-left font-super-squad text-parchment uppercase">
                    Criteria
                  </th>
                  <th className="p-4 text-left font-super-squad text-parchment uppercase">
                    Status
                  </th>
                  <th className="p-4 text-left font-super-squad text-parchment uppercase">
                    Last Triggered
                  </th>
                  <th className="p-4 text-left font-super-squad text-parchment uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <LoadingSpinner />
                      <p className="font-persona-aura text-gray-600 mt-4">Loading alerts...</p>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <AlertCircle size={48} className="mx-auto text-kirby-red mb-4" />
                      <p className="font-persona-aura text-kirby-red mb-2">Failed to load alerts</p>
                      <p className="font-persona-aura text-sm text-gray-600">
                        {error instanceof Error ? error.message : 'Unknown error occurred'}
                      </p>
                    </td>
                  </tr>
                ) : alerts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="font-persona-aura text-gray-600 mb-2">No alerts yet</p>
                      <p className="font-persona-aura text-sm text-gray-500">
                        Create your first alert to start monitoring prices and availability
                      </p>
                    </td>
                  </tr>
                ) : (
                  alerts.map((alert, index) => {
                    const typeConfig = alertTypeConfig[alert.type as keyof typeof alertTypeConfig] || alertTypeConfig['availability']
                    const Icon = typeConfig.icon
                    
                    return (
                      <tr 
                        key={alert.id}
                        className={`border-b-2 border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                                  hover:bg-golden-age-yellow hover:bg-opacity-10 transition-colors`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedAlerts.includes(alert.id)}
                            onChange={() => toggleSelectAlert(alert.id)}
                            className="w-4 h-4 border-2 border-ink-black"
                          />
                        </td>
                        <td className="p-4">
                          <p className="font-persona-aura font-semibold text-ink-black">
                            {alert.name}
                          </p>
                          {alert.description && (
                            <p className="font-persona-aura text-xs text-gray-500 mt-1">
                              {alert.description}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${typeConfig.bg}`}>
                            <Icon size={16} className={typeConfig.color} />
                            <span className={`font-persona-aura text-xs font-semibold ${typeConfig.color}`}>
                              {alert.type.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-persona-aura text-ink-black">
                            {alert.comic?.title || 'Any Comic'}
                          </p>
                          {alert.comic?.issue && (
                            <p className="font-persona-aura text-xs text-gray-500">
                              {alert.comic.issue}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="font-persona-aura text-sm text-gray-600">
                            {formatAlertCriteria(alert)}
                          </p>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleAlertStatus(alert.id, alert.isActive)}
                            disabled={updateAlertStatusMutation.isPending}
                            className="flex items-center space-x-2 disabled:opacity-50"
                          >
                            {alert.isActive ? (
                              <>
                                <ToggleRight size={24} className="text-green-600" />
                                <span className="font-persona-aura text-sm text-green-600 font-semibold">
                                  Active
                                </span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={24} className="text-gray-400" />
                                <span className="font-persona-aura text-sm text-gray-400 font-semibold">
                                  Inactive
                                </span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-4">
                          <p className="font-persona-aura text-sm text-gray-600">
                            {formatLastTriggered(alert.lastTriggered)}
                          </p>
                          {alert.triggerCount > 0 && (
                            <p className="font-persona-aura text-xs text-gray-500">
                              {alert.triggerCount} times
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-2 text-stan-lee-blue hover:bg-stan-lee-blue hover:text-parchment rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAlert(alert.id, alert.name)}
                              disabled={deleteAlertMutation.isPending}
                              className="p-2 text-kirby-red hover:bg-kirby-red hover:text-parchment rounded transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAlerts.length > 0 && (
          <div className="mt-4 p-4 bg-golden-age-yellow comic-border shadow-comic">
            <div className="flex justify-between items-center">
              <p className="font-persona-aura text-ink-black">
                <span className="font-semibold">{selectedAlerts.length}</span> alert(s) selected
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={handleBulkActivate}
                  disabled={updateAlertStatusMutation.isPending}
                  className="font-persona-aura font-semibold text-ink-black hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Activate Selected
                </button>
                <button 
                  onClick={handleBulkDeactivate}
                  disabled={updateAlertStatusMutation.isPending}
                  className="font-persona-aura font-semibold text-ink-black hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deactivate Selected
                </button>
                <button 
                  onClick={handleBulkDelete}
                  disabled={deleteAlertMutation.isPending}
                  className="font-persona-aura font-semibold text-kirby-red hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, alertId: '', alertName: '', isBulk: false })}
        onConfirm={deleteConfirmModal.isBulk ? executeBulkDelete : executeDeleteAlert}
        title={deleteConfirmModal.isBulk ? 'Delete Selected Alerts' : 'Delete Alert'}
        message={
          deleteConfirmModal.isBulk
            ? `Are you sure you want to delete ${selectedAlerts.length} alert(s)?\n\n${deleteConfirmModal.alertName}\n\nThis action cannot be undone.`
            : `Are you sure you want to delete the alert "${deleteConfirmModal.alertName}"?\n\nThis action cannot be undone.`
        }
        confirmText="Delete"
        isLoading={deleteAlertMutation.isPending}
        variant="danger"
      />

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}

export default AlertsPage

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
  DollarSign
} from 'lucide-react'

// Mock alerts data
const mockAlerts = [
  {
    id: '1',
    name: 'Spider-Man Price Drop',
    type: 'price-drop',
    comic: 'Amazing Spider-Man #1',
    criteria: 'Below £2,000',
    status: 'active',
    lastTriggered: '2 days ago',
    triggerCount: 3,
  },
  {
    id: '2',
    name: 'Batman Key Issues',
    type: 'new-issue',
    comic: 'Batman (Any)',
    criteria: 'Key Issue Available',
    status: 'active',
    lastTriggered: 'Never',
    triggerCount: 0,
  },
  {
    id: '3',
    name: 'X-Men Collection',
    type: 'availability',
    comic: 'X-Men #94-100',
    criteria: 'Near Mint Condition',
    status: 'inactive',
    lastTriggered: '1 week ago',
    triggerCount: 12,
  },
  {
    id: '4',
    name: 'Marvel Auction Ending',
    type: 'auction-ending',
    comic: 'Marvel Comics (Any)',
    criteria: 'Ending in 1 hour',
    status: 'active',
    lastTriggered: 'Today',
    triggerCount: 28,
  },
  {
    id: '5',
    name: 'Walking Dead Price Surge',
    type: 'price-increase',
    comic: 'The Walking Dead #1',
    criteria: 'Above £3,500',
    status: 'active',
    lastTriggered: '3 hours ago',
    triggerCount: 5,
  },
]

const alertTypeConfig = {
  'price-drop': { icon: TrendingDown, color: 'text-green-600', bg: 'bg-green-100' },
  'price-increase': { icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-100' },
  'new-issue': { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
  'availability': { icon: Bell, color: 'text-purple-600', bg: 'bg-purple-100' },
  'auction-ending': { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
}

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])

  const toggleAlertStatus = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id 
        ? { ...alert, status: alert.status === 'active' ? 'inactive' : 'active' }
        : alert
    ))
  }

  const deleteAlert = (id: string) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      setAlerts(alerts.filter(alert => alert.id !== id))
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
            <button className="comic-button flex items-center space-x-2">
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
              <p className="font-super-squad text-2xl text-ink-black">{alerts.length}</p>
              <p className="font-persona-aura text-sm text-gray-600">Total Alerts</p>
            </div>
            <div className="text-center">
              <p className="font-super-squad text-2xl text-green-600">
                {alerts.filter(a => a.status === 'active').length}
              </p>
              <p className="font-persona-aura text-sm text-gray-600">Active</p>
            </div>
            <div className="text-center">
              <p className="font-super-squad text-2xl text-kirby-red">
                {alerts.filter(a => a.lastTriggered !== 'Never' && a.lastTriggered.includes('hour')).length}
              </p>
              <p className="font-persona-aura text-sm text-gray-600">Triggered Today</p>
            </div>
            <div className="text-center">
              <p className="font-super-squad text-2xl text-golden-age-yellow">
                {alerts.reduce((sum, a) => sum + a.triggerCount, 0)}
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
                {alerts.map((alert, index) => {
                  const typeConfig = alertTypeConfig[alert.type as keyof typeof alertTypeConfig]
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
                          {alert.comic}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-persona-aura text-sm text-gray-600">
                          {alert.criteria}
                        </p>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleAlertStatus(alert.id)}
                          className="flex items-center space-x-2"
                        >
                          {alert.status === 'active' ? (
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
                          {alert.lastTriggered}
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
                            onClick={() => deleteAlert(alert.id)}
                            className="p-2 text-kirby-red hover:bg-kirby-red hover:text-parchment rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
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
                <button className="font-persona-aura font-semibold text-ink-black hover:text-kirby-red">
                  Activate Selected
                </button>
                <button className="font-persona-aura font-semibold text-ink-black hover:text-kirby-red">
                  Deactivate Selected
                </button>
                <button className="font-persona-aura font-semibold text-kirby-red hover:text-red-700">
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertsPage

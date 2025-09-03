import React, { useState } from 'react'
import { 
  User, 
  Mail, 
  Lock, 
  CreditCard, 
  Bell, 
  Shield, 
  LogOut,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Zap,
  Download,
  Database
} from 'lucide-react'
import { SUBSCRIPTION_TIERS } from '@/utils/constants'
import { fetchAllComicsForUser } from '@/services/collectionService'
import { generateCSV, downloadCSV } from '@/utils/csvExport'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    newsletter: true,
    priceAlerts: true,
  })
  const [isExporting, setIsExporting] = useState(false)

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data Management', icon: Database },
  ]

  const handleExportCSV = async () => {
    try {
      setIsExporting(true)
      
      // Get the current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast.error('Please log in to export your collection.')
        return
      }
      
      toast.info('Fetching your comic collection...')
      
      const comics = await fetchAllComicsForUser(user.id)
      
      if (comics.length === 0) {
        toast.warning('No comics found in your collection to export')
        return
      }

      toast.info('Generating CSV file...')
      
      const csvContent = generateCSV(comics)
      downloadCSV(csvContent)
      
      toast.success(`Successfully exported ${comics.length} comics to CSV!`)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast.error('Failed to export collection. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-parchment">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-stan-lee-blue to-kirby-red py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-super-squad text-4xl md:text-5xl text-parchment">
            ACCOUNT SETTINGS
          </h1>
          <p className="font-persona-aura text-parchment opacity-90 mt-2">
            Manage your profile and preferences
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white comic-border shadow-comic p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-150
                              ${activeTab === tab.id 
                                ? 'bg-kirby-red text-parchment translate-x-[-2px] translate-y-[-2px] shadow-comic' 
                                : 'hover:bg-golden-age-yellow hover:bg-opacity-20'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <tab.icon size={18} />
                      <span className="font-persona-aura font-semibold">
                        {tab.label}
                      </span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t-2 border-gray-200">
                <button className="w-full flex items-center justify-center space-x-2 text-kirby-red hover:bg-kirby-red hover:text-parchment px-4 py-3 transition-colors">
                  <LogOut size={18} />
                  <span className="font-persona-aura font-semibold">Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white comic-border shadow-comic p-8">
                <h2 className="font-super-squad text-2xl text-ink-black mb-6">
                  PROFILE INFORMATION
                </h2>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Comic"
                        className="w-full comic-input"
                      />
                    </div>
                    <div>
                      <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Fan"
                        className="w-full comic-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="fan@comicscout.uk"
                      className="w-full comic-input"
                    />
                  </div>

                  <div>
                    <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue="ComicCollector2024"
                      className="w-full comic-input"
                    />
                  </div>

                  <div>
                    <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      defaultValue="Passionate comic collector specializing in Silver Age Marvel and modern indie titles."
                      className="w-full comic-input resize-none"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button type="button" className="px-6 py-3 font-persona-aura font-semibold text-ink-black hover:text-kirby-red">
                      Cancel
                    </button>
                    <button type="submit" className="comic-button">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                {/* Current Plan */}
                <div className="bg-white comic-border shadow-comic p-8">
                  <h2 className="font-super-squad text-2xl text-ink-black mb-6">
                    CURRENT PLAN
                  </h2>
                  
                  <div className="bg-golden-age-yellow bg-opacity-20 border-2 border-golden-age-yellow p-6 mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-super-squad text-xl text-ink-black mb-2">
                          PRO PLAN
                        </h3>
                        <p className="font-persona-aura text-gray-700 mb-4">
                          Perfect for serious collectors
                        </p>
                        <ul className="space-y-2">
                          {SUBSCRIPTION_TIERS.PRO.features.map((feature) => (
                            <li key={feature} className="flex items-center space-x-2">
                              <Check size={16} className="text-green-600" />
                              <span className="font-persona-aura text-sm text-ink-black">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right">
                        <p className="font-super-squad text-3xl text-ink-black">
                          £{SUBSCRIPTION_TIERS.PRO.price}
                        </p>
                        <p className="font-persona-aura text-sm text-gray-600">
                          per month
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="font-persona-aura text-sm text-gray-600">
                      Next billing date: January 1, 2025
                    </p>
                    <button className="text-kirby-red hover:text-red-700 font-persona-aura font-semibold">
                      Cancel Subscription
                    </button>
                  </div>
                </div>

                {/* Available Plans */}
                <div className="bg-white comic-border shadow-comic p-8">
                  <h2 className="font-super-squad text-2xl text-ink-black mb-6">
                    AVAILABLE PLANS
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
                      <div 
                        key={key}
                        className={`border-comic border-ink-black shadow-comic p-6 hover:translate-y-[-4px] transition-transform
                                  ${key === 'PRO' ? 'bg-golden-age-yellow bg-opacity-10' : 'bg-white'}`}
                      >
                        {key === 'PREMIUM' && (
                          <div className="bg-kirby-red text-parchment text-center py-1 mb-4 -mt-6 -mx-6">
                            <span className="font-super-squad text-sm">MOST POPULAR</span>
                          </div>
                        )}
                        <h3 className="font-super-squad text-xl text-ink-black mb-2">
                          {tier.name}
                        </h3>
                        <p className="font-super-squad text-3xl text-ink-black mb-4">
                          £{tier.price}
                          <span className="font-persona-aura text-sm text-gray-600">/mo</span>
                        </p>
                        <ul className="space-y-2 mb-6">
                          {tier.features.slice(0, 4).map((feature) => (
                            <li key={feature} className="flex items-start space-x-2">
                              <Check size={16} className="text-green-600 mt-0.5" />
                              <span className="font-persona-aura text-xs text-ink-black">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <button 
                          className={`w-full ${key === 'PRO' ? 'comic-button-secondary' : 'comic-button'} text-sm`}
                          disabled={key === 'PRO'}
                        >
                          {key === 'PRO' ? 'Current Plan' : key === 'FREE' ? 'Downgrade' : 'Upgrade'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white comic-border shadow-comic p-8">
                <h2 className="font-super-squad text-2xl text-ink-black mb-6">
                  NOTIFICATION PREFERENCES
                </h2>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 border-2 border-gray-200">
                    <div>
                      <p className="font-persona-aura font-semibold text-ink-black">
                        Email Notifications
                      </p>
                      <p className="font-persona-aura text-sm text-gray-600">
                        Receive updates about your collection via email
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications({...notifications, email: !notifications.email})}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications.email ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        notifications.email ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-4 border-2 border-gray-200">
                    <div>
                      <p className="font-persona-aura font-semibold text-ink-black">
                        Push Notifications
                      </p>
                      <p className="font-persona-aura text-sm text-gray-600">
                        Get instant alerts on your device
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications({...notifications, push: !notifications.push})}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications.push ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        notifications.push ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-4 border-2 border-gray-200">
                    <div>
                      <p className="font-persona-aura font-semibold text-ink-black">
                        Weekly Newsletter
                      </p>
                      <p className="font-persona-aura text-sm text-gray-600">
                        Comic news and market trends every Friday
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications({...notifications, newsletter: !notifications.newsletter})}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications.newsletter ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        notifications.newsletter ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-4 border-2 border-gray-200">
                    <div>
                      <p className="font-persona-aura font-semibold text-ink-black">
                        Price Alert Notifications
                      </p>
                      <p className="font-persona-aura text-sm text-gray-600">
                        Instant alerts when your watched comics hit target prices
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications({...notifications, priceAlerts: !notifications.priceAlerts})}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications.priceAlerts ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        notifications.priceAlerts ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200">
                  <div className="flex items-start space-x-3">
                    <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-persona-aura font-semibold text-blue-900">
                        Pro Tip
                      </p>
                      <p className="font-persona-aura text-sm text-blue-700">
                        Enable push notifications to never miss a hot deal on your wishlist items!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white comic-border shadow-comic p-8">
                <h2 className="font-super-squad text-2xl text-ink-black mb-6">
                  SECURITY SETTINGS
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-persona-aura font-semibold text-ink-black mb-4">
                      Change Password
                    </h3>
                    <form className="space-y-4">
                      <div>
                        <label className="block font-persona-aura text-sm text-gray-600 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full comic-input"
                        />
                      </div>
                      <div>
                        <label className="block font-persona-aura text-sm text-gray-600 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full comic-input"
                        />
                      </div>
                      <div>
                        <label className="block font-persona-aura text-sm text-gray-600 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full comic-input"
                        />
                      </div>
                      <button type="submit" className="comic-button">
                        Update Password
                      </button>
                    </form>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-6">
                    <h3 className="font-persona-aura font-semibold text-ink-black mb-4">
                      Two-Factor Authentication
                    </h3>
                    <p className="font-persona-aura text-sm text-gray-600 mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <button className="comic-button-secondary flex items-center space-x-2">
                      <Shield size={18} />
                      <span>Enable 2FA</span>
                    </button>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-6">
                    <h3 className="font-persona-aura font-semibold text-ink-black mb-4">
                      Active Sessions
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 border-2 border-gray-200">
                        <div>
                          <p className="font-persona-aura font-semibold text-ink-black">
                            Chrome on Windows
                          </p>
                          <p className="font-persona-aura text-xs text-gray-600">
                            London, UK • Current session
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-700 px-2 py-1 text-xs font-persona-aura font-semibold">
                          ACTIVE
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 border-2 border-gray-200">
                        <div>
                          <p className="font-persona-aura font-semibold text-ink-black">
                            Safari on iPhone
                          </p>
                          <p className="font-persona-aura text-xs text-gray-600">
                            Manchester, UK • Last active 2 hours ago
                          </p>
                        </div>
                        <button className="text-kirby-red hover:text-red-700 font-persona-aura text-sm font-semibold">
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Management Tab */}
            {activeTab === 'data' && (
              <div className="bg-white comic-border shadow-comic p-8">
                <h2 className="font-super-squad text-2xl text-ink-black mb-6">
                  DATA MANAGEMENT
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-persona-aura font-semibold text-ink-black mb-4">
                      Export Collection
                    </h3>
                    <p className="font-persona-aura text-sm text-gray-600 mb-6">
                      Download your entire comic collection as a CSV file for backup or use in other applications.
                    </p>
                    
                    <div className="bg-blue-50 border-2 border-blue-200 p-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-persona-aura font-semibold text-blue-900 mb-1">
                            What's Included
                          </p>
                          <ul className="font-persona-aura text-sm text-blue-700 space-y-1">
                            <li>• All comic titles, issues, and publishers</li>
                            <li>• Market values and purchase information</li>
                            <li>• Condition ratings and personal notes</li>
                            <li>• Key issue designations and reasons</li>
                            <li>• Publication years and formats</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleExportCSV}
                      disabled={isExporting}
                      className="comic-button flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-parchment"></div>
                          <span>Exporting...</span>
                        </>
                      ) : (
                        <>
                          <Download size={18} />
                          <span>Export My Collection to CSV</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-6">
                    <h3 className="font-persona-aura font-semibold text-ink-black mb-4">
                      File Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-persona-aura text-sm text-gray-600">File Format:</span>
                        <span className="font-persona-aura text-sm text-ink-black font-semibold">CSV (Comma-Separated Values)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-persona-aura text-sm text-gray-600">Default Filename:</span>
                        <span className="font-persona-aura text-sm text-ink-black font-semibold">comicscoutuk_collection_export.csv</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-persona-aura text-sm text-gray-600">Encoding:</span>
                        <span className="font-persona-aura text-sm text-ink-black font-semibold">UTF-8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountPage

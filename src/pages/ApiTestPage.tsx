import React, { useState } from 'react'
import { Play, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ApiResponse {
  status: number
  data: any
  error?: string
}

const ApiTestPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)

  const testGoCollectApi = async () => {
    setIsLoading(true)
    setResponse(null)

    try {
      const apiKey = '7GnRRxsw3JMYnZF9rW8fF7VU8gJVK5q71KKvURNwd2a24cf0'
      const query = 'Amazing Spider-Man 1'
      
      // GoCollect API endpoint (assuming based on common API patterns)
      const url = `https://gocollect.com/api/search?query=${encodeURIComponent(query)}&key=${apiKey}`
      
      const apiResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey, // Alternative header format
        },
      })

      const data = await apiResponse.json()

      setResponse({
        status: apiResponse.status,
        data: data,
        error: apiResponse.ok ? undefined : `HTTP ${apiResponse.status}: ${apiResponse.statusText}`
      })
    } catch (error) {
      setResponse({
        status: 0,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (!response) return null
    
    if (response.error) {
      return <AlertCircle className="text-red-500" size={20} />
    } else if (response.status >= 200 && response.status < 300) {
      return <CheckCircle className="text-green-500" size={20} />
    } else {
      return <AlertCircle className="text-yellow-500" size={20} />
    }
  }

  const getStatusColor = () => {
    if (!response) return 'text-gray-500'
    
    if (response.error) {
      return 'text-red-600'
    } else if (response.status >= 200 && response.status < 300) {
      return 'text-green-600'
    } else {
      return 'text-yellow-600'
    }
  }

  return (
    <div className="min-h-screen bg-parchment py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white comic-border shadow-comic p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-super-squad text-3xl text-ink-black mb-2">
              🔬 GOCOLLECT API TEST
            </h1>
            <p className="font-persona-aura text-gray-600">
              Temporary testing page for GoCollect API integration
            </p>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-persona-aura text-sm">
                <strong>Note:</strong> This is a temporary test page and will be removed after confirming API functionality.
              </p>
            </div>
          </div>

          {/* Test Section */}
          <div className="mb-8">
            <h2 className="font-super-squad text-xl text-ink-black mb-4">
              TEST CONFIGURATION
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Test Query
                </label>
                <p className="font-mono text-sm text-gray-900 bg-white p-2 rounded border">
                  Amazing Spider-Man 1
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  API Key
                </label>
                <p className="font-mono text-sm text-gray-900 bg-white p-2 rounded border truncate">
                  7GnRRxsw3JMYnZF9rW8fF7VU8gJVK5q71KKvURNwd2a24cf0
                </p>
              </div>
            </div>
          </div>

          {/* Test Button */}
          <div className="mb-8">
            <button
              onClick={testGoCollectApi}
              disabled={isLoading}
              className="comic-button flex items-center justify-center space-x-2 w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Clock size={20} className="animate-spin" />
                  <span>Testing API...</span>
                </>
              ) : (
                <>
                  <Play size={20} />
                  <span>Test GoCollect API</span>
                </>
              )}
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="mb-8 flex justify-center">
              <LoadingSpinner size="md" text="Calling GoCollect API..." />
            </div>
          )}

          {/* Response Section */}
          {response && (
            <div className="space-y-6">
              <h2 className="font-super-squad text-xl text-ink-black">
                API RESPONSE
              </h2>

              {/* Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon()}
                  <h3 className="font-semibold text-gray-900">Status</h3>
                </div>
                <p className={`font-mono text-lg ${getStatusColor()}`}>
                  {response.status > 0 ? `HTTP ${response.status}` : 'Network Error'}
                </p>
                {response.error && (
                  <p className="text-red-600 mt-2 text-sm">{response.error}</p>
                )}
              </div>

              {/* Response Data */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Response Data</h3>
                <div className="bg-white p-4 rounded border overflow-auto max-h-96">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Response Headers Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Response Info</h3>
                <div className="text-sm text-blue-800">
                  <p><strong>Status Code:</strong> {response.status}</p>
                  <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
                  <p><strong>Query:</strong> Amazing Spider-Man 1</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApiTestPage
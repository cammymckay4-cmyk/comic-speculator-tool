import React, { useState } from 'react'

interface TestResult {
  url: string
  success: boolean
  data: any
  error?: string
  timestamp: string
}

const API_KEY = import.meta.env.VITE_GOCOLLECT_API_KEY || 'demo-key'

const ApiTestPage: React.FC = () => {
  const [results, setResults] = useState<Record<string, TestResult | null>>({
    test1: null
  })
  const [loading, setLoading] = useState<Record<string, boolean>>({
    test1: false
  })

  const testEndpoints = [
    {
      key: 'test1',
      label: 'Test 1: GoCollect Collectibles Search (Incredible Hulk 181)',
      url: 'https://gocollect.com/api/collectibles/v1/item/search?query=Incredible+Hulk+181&cam=Comics'
    }
  ]

  const runTest = async (testKey: string, url: string) => {
    setLoading(prev => ({ ...prev, [testKey]: true }))
    
    try {
      console.log(`Running ${testKey}: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      
      let data
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }
      
      const result: TestResult = {
        url,
        success: response.ok,
        data,
        timestamp: new Date().toISOString()
      }
      
      if (!response.ok) {
        result.error = `HTTP ${response.status}: ${response.statusText}`
      }
      
      setResults(prev => ({ ...prev, [testKey]: result }))
      
    } catch (error) {
      console.error(`Error in ${testKey}:`, error)
      
      let errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Check if it's a CORS error
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'CORS blocked - API must be called from backend'
      }
      
      setResults(prev => ({ 
        ...prev, 
        [testKey]: {
          url,
          success: false,
          data: null,
          error: errorMessage,
          timestamp: new Date().toISOString()
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [testKey]: false }))
    }
  }

  const clearResults = () => {
    setResults({
      test1: null
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">GoCollect API Test Page</h1>
        
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="font-semibold mb-2">API Configuration</h2>
          <p className="text-sm text-gray-600">
            Using API Key: {API_KEY === 'demo-key' ? 'No API key configured (using demo-key)' : '***configured***'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Set VITE_GOCOLLECT_API_KEY in your .env file to use a real API key.
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-semibold mb-2">Important Note</h2>
          <p className="text-sm text-gray-700">
            The GoCollect API is working but browser security prevents direct calls due to CORS (Cross-Origin Resource Sharing) restrictions.
            When you see a "CORS blocked" error, this is expected behavior.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Solution:</strong> We need to create a backend proxy to call the GoCollect API from our server instead of directly from the browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {testEndpoints.map(endpoint => (
            <div key={endpoint.key} className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-semibold mb-2">{endpoint.label}</h3>
              <p className="text-sm text-gray-600 mb-3 font-mono bg-gray-100 p-2 rounded">
                {endpoint.url}
              </p>
              <button
                onClick={() => runTest(endpoint.key, endpoint.url)}
                disabled={loading[endpoint.key]}
                className={`w-full py-2 px-4 rounded font-medium ${
                  loading[endpoint.key]
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {loading[endpoint.key] ? 'Testing...' : 'Run Test'}
              </button>
            </div>
          ))}
        </div>

        <div className="mb-6 flex justify-center">
          <button
            onClick={clearResults}
            className="py-2 px-6 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium"
          >
            Clear All Results
          </button>
        </div>

        {Object.entries(results).some(([_, result]) => result !== null) && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Test Results</h2>
            
            {testEndpoints.map(endpoint => {
              const result = results[endpoint.key]
              if (!result) return null
              
              return (
                <div key={endpoint.key} className="border border-gray-300 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{endpoint.label}</h3>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <strong>URL:</strong>
                      <div className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                        {result.url}
                      </div>
                    </div>
                    
                    <div>
                      <strong>Timestamp:</strong>
                      <span className="ml-2 text-sm text-gray-600">{result.timestamp}</span>
                    </div>
                    
                    {result.error && (
                      <div>
                        <strong>Error:</strong>
                        <div className="text-red-600 bg-red-50 p-2 rounded mt-1">
                          {result.error}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <strong>Response:</strong>
                      <pre className="text-sm bg-gray-100 p-3 rounded mt-1 overflow-auto max-h-96">
                        {typeof result.data === 'string' 
                          ? result.data 
                          : JSON.stringify(result.data, null, 2)
                        }
                      </pre>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ApiTestPage
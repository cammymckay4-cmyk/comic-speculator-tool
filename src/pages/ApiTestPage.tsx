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
    test1: null,
    test2: null,
    test3: null,
    test4: null
  })
  const [loading, setLoading] = useState<Record<string, boolean>>({
    test1: false,
    test2: false,
    test3: false,
    test4: false
  })

  const testEndpoints = [
    {
      key: 'test1',
      label: 'Test 1: Search Comics',
      url: 'https://api.gocollect.com/v1/comics/search?q=Amazing Spider-Man 1'
    },
    {
      key: 'test2',
      label: 'Test 2: Comics by Title/Issue',
      url: 'https://api.gocollect.com/v1/comics?title=Amazing Spider-Man&issue=1'
    },
    {
      key: 'test3',
      label: 'Test 3: Search Comics Alt',
      url: 'https://api.gocollect.com/v1/search/comics?query=Amazing Spider-Man 1'
    },
    {
      key: 'test4',
      label: 'Test 4: General Search',
      url: 'https://api.gocollect.com/api/v1/search?q=Amazing Spider-Man 1'
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
      
      setResults(prev => ({ 
        ...prev, 
        [testKey]: {
          url,
          success: false,
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [testKey]: false }))
    }
  }

  const clearResults = () => {
    setResults({
      test1: null,
      test2: null,
      test3: null,
      test4: null
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
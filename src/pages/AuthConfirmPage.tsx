import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, AlertCircle, Loader } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useUserStore } from '@/store/userStore'
import { COMIC_EFFECTS } from '@/utils/constants'

const AuthConfirmPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const { setUser } = useUserStore()

  const selectedEffect = COMIC_EFFECTS[Math.floor(Math.random() * COMIC_EFFECTS.length)]

  useEffect(() => {
    const confirmUser = async () => {
      try {
        // Get redirect parameter from URL
        const redirectTo = searchParams.get('redirect')
        console.log('Auth confirmation - redirect parameter:', redirectTo)
        
        // First check if user is already authenticated (no token needed)
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // User is already verified, redirect to intended destination or account page
          console.log('User already authenticated, redirecting to:', redirectTo || '/account')
          navigate(redirectTo || '/account')
          return
        }

        // Check for both token_hash and token parameters (Supabase sends different parameter names inconsistently)
        const token = searchParams.get('token_hash') || searchParams.get('token')
        const type = searchParams.get('type')

        // Debug logging for troubleshooting
        console.log('Auth confirmation attempt:', {
          token_hash: searchParams.get('token_hash'),
          token: searchParams.get('token'),
          finalToken: token,
          type,
          redirectTo,
          allParams: Object.fromEntries(searchParams.entries()),
          hasSession: !!session
        })

        // Only try token verification if NOT already authenticated and token exists
        if (!token) {
          setStatus('error')
          setMessage('Invalid or expired verification link. Please sign up again or contact support.')
          return
        }

        // Verify the user's email
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any || 'signup'
        })

        if (error) {
          setStatus('error')
          setMessage(error.message || 'Failed to confirm email. The link may have expired.')
          return
        }

        if (data.user) {
          // Update user store
          setUser({
            id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            avatar: data.user.user_metadata?.avatar_url || null,
          })

          setStatus('success')
          setMessage('Your email has been confirmed successfully!')
          
          // Redirect to intended destination or account page after a short delay
          const finalDestination = redirectTo || '/account'
          console.log('Email confirmed successfully, redirecting to:', finalDestination)
          setTimeout(() => {
            navigate(finalDestination)
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Failed to confirm email. Please try again.')
        }
      } catch (error) {
        console.error('Confirmation error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred during confirmation.')
      }
    }

    confirmUser()
  }, [searchParams, navigate, setUser])

  return (
    <div className="min-h-screen bg-gradient-to-br from-stan-lee-blue to-kirby-red flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-super-squad text-5xl text-parchment mb-2">
            {selectedEffect}
          </h1>
          <h2 className="font-super-squad text-3xl text-parchment">
            COMICSCOUT UK
          </h2>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white comic-border shadow-comic-lg p-8 text-center">
          {status === 'loading' && (
            <div>
              <Loader className="animate-spin mx-auto mb-4 text-stan-lee-blue" size={48} />
              <h3 className="font-super-squad text-xl text-ink-black mb-2">
                CONFIRMING EMAIL...
              </h3>
              <p className="font-persona-aura text-gray-600">
                Please wait while we verify your email address.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <Check className="mx-auto mb-4 text-green-600" size={48} />
              <h3 className="font-super-squad text-xl text-green-600 mb-2">
                EMAIL CONFIRMED!
              </h3>
              <p className="font-persona-aura text-gray-600 mb-4">
                {message}
              </p>
              <p className="font-persona-aura text-sm text-gray-500">
                Redirecting you to {searchParams.get('redirect') ? 'your destination' : 'your account page'}...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <AlertCircle className="mx-auto mb-4 text-kirby-red" size={48} />
              <h3 className="font-super-squad text-xl text-kirby-red mb-2">
                CONFIRMATION FAILED
              </h3>
              <p className="font-persona-aura text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full comic-button"
                >
                  SIGN UP AGAIN
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 px-4 border-2 border-gray-300 hover:border-ink-black hover:shadow-comic-sm transition-all font-persona-aura text-sm font-semibold"
                >
                  GO TO HOME
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Text */}
        <p className="text-center mt-6 font-persona-aura text-sm text-parchment opacity-80">
          © 2024 ComicScoutUK. With great comics comes great responsibility.
        </p>
      </div>
    </div>
  )
}

export default AuthConfirmPage
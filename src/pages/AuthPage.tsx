import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  AlertCircle,
  Check
} from 'lucide-react'
import { COMIC_EFFECTS } from '@/utils/constants'
import { supabase, createSupabaseClientWithPersistence } from '@/lib/supabaseClient'
import { signUp, signIn } from '@/services/authService'
import { useUserStore } from '@/store/userStore'

type AuthMode = 'signin' | 'signup' | 'forgot'

const AuthPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { setUser } = useUserStore()

  const selectedEffect = COMIC_EFFECTS[Math.floor(Math.random() * COMIC_EFFECTS.length)]

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const result = await signIn({ email, password }, rememberMe)

      if (!result.success) {
        setErrors({ auth: result.error || 'Sign in failed' })
        return
      }

      if (result.user) {
        setUser(result.user)
        
        // Check for redirect parameter and navigate to it, otherwise go to account page
        const redirectTo = searchParams.get('redirect')
        navigate(redirectTo || '/account')
      }
    } catch (error) {
      setErrors({ auth: 'An unexpected error occurred' })
    }
  }

  const handleSignup = async (email: string, password: string, name: string) => {
    try {
      const result = await signUp({ email, password, name })

      // Debug logs after signUp call
      console.log('Signup error:', result.success ? null : result.error);
      console.log('Error type:', typeof result.error);
      console.log('Error message:', result.error);

      if (!result.success) {
        // Any error means we should show error message, NOT success message
        setErrors({ auth: result.error || 'An error occurred during signup' })
        setSuccessMessage('') // Clear any success message
        
        // Check if it's a duplicate email error to auto-switch to sign in
        const errorMsg = result.error?.toLowerCase() || ''
        const isDuplicateEmail = errorMsg.includes('already registered') ||
                                errorMsg.includes('email already exists') ||
                                errorMsg.includes('user already exists') ||
                                errorMsg.includes('already been registered') ||
                                errorMsg.includes('duplicate key value') ||
                                errorMsg.includes('email address is already registered') ||
                                errorMsg.includes('user with this email already exists')
        
        if (isDuplicateEmail) {
          // Auto-switch to sign in tab after showing error
          setTimeout(() => setMode('signin'), 2000)
        }
        return
      }

      // Debug log before setting success message
      console.log('About to show success - should not reach here if error');

      // Only show success message if signup was actually successful (no error)
      setErrors({}) // Clear any errors
      setSuccessMessage('Check your email to confirm your account!')
      console.log('Success message set:', 'Check your email to confirm your account!');
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false,
        agreeToTerms: false,
      })
    } catch (error) {
      setErrors({ auth: 'An unexpected error occurred' })
      setSuccessMessage('') // Clear any success message
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')
    setIsLoading(true)

    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (mode !== 'forgot') {
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters'
      }
    }

    if (mode === 'signup') {
      if (!formData.name) {
        newErrors.name = 'Name is required'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    // Handle authentication
    if (mode === 'signin') {
      await handleLogin(formData.email, formData.password, formData.rememberMe)
    } else if (mode === 'signup') {
      await handleSignup(formData.email, formData.password, formData.name)
    } else if (mode === 'forgot') {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email)
        if (error) {
          setErrors({ auth: error.message })
        } else {
          setSuccessMessage('Check your email for password reset instructions!')
        }
      } catch (error) {
        setErrors({ auth: 'An unexpected error occurred' })
      }
    }

    setIsLoading(false)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value })
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

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

        {/* Auth Card */}
        <div className="bg-white comic-border shadow-comic-lg p-8">
          {/* Mode Tabs */}
          <div className="flex border-b-2 border-ink-black mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-3 font-super-squad text-sm transition-colors
                        ${mode === 'signin' 
                          ? 'bg-kirby-red text-parchment' 
                          : 'text-ink-black hover:bg-golden-age-yellow hover:bg-opacity-20'}`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 font-super-squad text-sm transition-colors border-l-2 border-ink-black
                        ${mode === 'signup' 
                          ? 'bg-kirby-red text-parchment' 
                          : 'text-ink-black hover:bg-golden-age-yellow hover:bg-opacity-20'}`}
            >
              SIGN UP
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border-2 border-green-200 rounded">
              <p className="text-green-800 text-sm font-persona-aura flex items-center">
                <Check size={14} className="mr-1" />
                {successMessage}
              </p>
            </div>
          )}

          {/* Auth Error */}
          {errors.auth && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded">
              <p className="text-red-800 text-sm font-persona-aura flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.auth}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 comic-input ${errors.name ? 'border-kirby-red' : ''}`}
                    placeholder="Peter Parker"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-kirby-red text-xs font-persona-aura flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 comic-input ${errors.email ? 'border-kirby-red' : ''}`}
                  placeholder="hero@comicscout.uk"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-kirby-red text-xs font-persona-aura flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            {mode !== 'forgot' && (
              <div>
                <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 comic-input ${errors.password ? 'border-kirby-red' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-ink-black"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-kirby-red text-xs font-persona-aura flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>
            )}

            {/* Confirm Password Field (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <label className="block font-persona-aura font-semibold text-ink-black mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 comic-input ${errors.confirmPassword ? 'border-kirby-red' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-ink-black"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-kirby-red text-xs font-persona-aura flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Remember Me / Terms */}
            {mode === 'signin' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                    className="w-4 h-4 text-kirby-red border-2 border-ink-black focus:ring-0"
                  />
                  <span className="font-persona-aura text-sm text-ink-black">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="font-persona-aura text-sm text-stan-lee-blue hover:text-kirby-red transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    className="w-4 h-4 text-kirby-red border-2 border-ink-black focus:ring-0 mt-0.5"
                  />
                  <span className="font-persona-aura text-sm text-ink-black">
                    I agree to the{' '}
                    <a href="#" className="text-stan-lee-blue hover:text-kirby-red">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-stan-lee-blue hover:text-kirby-red">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-kirby-red text-xs font-persona-aura flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.agreeToTerms}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full comic-button flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>LOADING...</span>
              ) : (
                <>
                  <span>
                    {mode === 'signin' && 'SIGN IN'}
                    {mode === 'signup' && 'CREATE ACCOUNT'}
                    {mode === 'forgot' && 'RESET PASSWORD'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          {mode === 'forgot' && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setMode('signin')}
                className="font-persona-aura text-sm text-stan-lee-blue hover:text-kirby-red transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Social Login */}
          {mode !== 'forgot' && (
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <p className="font-persona-aura text-sm text-gray-600 text-center mb-4">
                Or continue with
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button className="py-2 px-4 border-2 border-gray-300 hover:border-ink-black hover:shadow-comic-sm transition-all font-persona-aura text-sm font-semibold">
                  Google
                </button>
                <button className="py-2 px-4 border-2 border-gray-300 hover:border-ink-black hover:shadow-comic-sm transition-all font-persona-aura text-sm font-semibold">
                  Facebook
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

export default AuthPage

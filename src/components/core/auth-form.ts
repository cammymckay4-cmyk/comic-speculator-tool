import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import ComicInput from './ComicInput';
import ComicButton from './ComicButton';

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

interface AuthFormProps {
  onSignIn?: (data: AuthFormData) => Promise<void>;
  onSignUp?: (data: AuthFormData) => Promise<void>;
  onForgotPassword?: (email: string) => Promise<void>;
  onNavigateToPricing?: () => void;
  initialMode?: 'signin' | 'signup';
  loading?: boolean;
  error?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  onSignIn,
  onSignUp,
  onForgotPassword,
  onNavigateToPricing,
  initialMode = 'signin',
  loading = false,
  error,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<Partial<AuthFormData>>({});

  const validateForm = (): boolean => {
    const errors: Partial<AuthFormData> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password && mode !== 'forgot') {
      errors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 8 && mode !== 'forgot') {
      errors.password = 'Password must be at least 8 characters';
    }

    // Name validation for signup
    if (mode === 'signup' && !formData.name) {
      errors.name = 'Name is required';
    }

    // Confirm password validation for signup
    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      switch (mode) {
        case 'signin':
          await onSignIn?.(formData);
          break;
        case 'signup':
          await onSignUp?.(formData);
          break;
        case 'forgot':
          await onForgotPassword?.(formData.email);
          break;
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const handleInputChange = (field: keyof AuthFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    setValidationErrors({});
    if (newMode === 'forgot') {
      setFormData(prev => ({ ...prev, password: '', name: '', confirmPassword: '' }));
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Reset Password';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome back to your comic universe!';
      case 'signup': return 'Join the ultimate comic tracking experience!';
      case 'forgot': return 'Enter your email to reset your password';
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bangers text-4xl text-kirby-red uppercase tracking-wide mb-2">
            ComicScoutUK
          </h1>
          <div className="w-24 h-1 bg-golden-age-yellow mx-auto mb-6"></div>
        </div>

        {/* Main Form Container */}
        <div className="comic-border bg-parchment p-8 shadow-comic-lg">
          {/* Form Header */}
          <div className="text-center mb-6">
            <h2 className="font-bangers text-2xl text-ink-black uppercase tracking-wide mb-2">
              {getTitle()}
            </h2>
            <p className="font-inter text-ink-black opacity-70 text-sm">
              {getSubtitle()}
            </p>
          </div>

          {/* Tab Navigation */}
          {mode !== 'forgot' && (
            <div className="flex mb-6 comic-border bg-gray-50">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`flex-1 py-3 px-4 font-inter font-semibold text-sm uppercase tracking-wide transition-all duration-200 ${
                  mode === 'signin'
                    ? 'bg-kirby-red text-parchment shadow-comic transform -translate-x-1 -translate-y-1'
                    : 'bg-parchment text-ink-black hover:bg-golden-age-yellow hover:bg-opacity-20'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 py-3 px-4 font-inter font-semibold text-sm uppercase tracking-wide transition-all duration-200 ${
                  mode === 'signup'
                    ? 'bg-kirby-red text-parchment shadow-comic transform -translate-x-1 -translate-y-1'
                    : 'bg-parchment text-ink-black hover:bg-golden-age-yellow hover:bg-opacity-20'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Global Error Message */}
          {error && (
            <div className="mb-4 comic-border bg-red-50 border-kirby-red p-3 text-kirby-red text-sm font-inter">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field - Only for signup */}
            {mode === 'signup' && (
              <ComicInput
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange('name')}
                icon={User}
                error={validationErrors.name}
                required
                disabled={loading}
              />
            )}

            {/* Email Field */}
            <ComicInput
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange('email')}
              icon={Mail}
              error={validationErrors.email}
              required
              disabled={loading}
            />

            {/* Password Field - Not for forgot password */}
            {mode !== 'forgot' && (
              <ComicInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange('password')}
                icon={Lock}
                error={validationErrors.password}
                hint={mode === 'signup' ? 'Must be at least 8 characters' : undefined}
                required
                disabled={loading}
              />
            )}

            {/* Confirm Password Field - Only for signup */}
            {mode === 'signup' && (
              <ComicInput
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                icon={Lock}
                error={validationErrors.confirmPassword}
                required
                disabled={loading}
              />
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <ComicButton
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
                icon={ArrowRight}
                iconPosition="right"
              >
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Email'}
              </ComicButton>
            </div>
          </form>

          {/* Additional Actions */}
          <div className="mt-6 space-y-3">
            {/* Forgot Password Link */}
            {mode === 'signin' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="font-inter text-sm text-ink-black opacity-70 hover:opacity-100 hover:text-kirby-red transition-colors duration-200 underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            {/* Back to Sign In from Forgot Password */}
            {mode === 'forgot' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="font-inter text-sm text-ink-black opacity-70 hover:opacity-100 hover:text-kirby-red transition-colors duration-200 underline"
                >
                  Back to Sign In
                </button>
              </div>
            )}

            {/* Pricing Link for Signup */}
            {mode === 'signup' && onNavigateToPricing && (
              <div className="pt-4 border-t border-ink-black border-opacity-20">
                <p className="font-inter text-xs text-ink-black opacity-60 text-center mb-3">
                  By creating an account, you'll get access to our free tier. Upgrade anytime for premium features.
                </p>
                <button
                  type="button"
                  onClick={onNavigateToPricing}
                  className="w-full font-inter text-sm text-stan-lee-blue hover:text-kirby-red transition-colors duration-200 underline text-center"
                >
                  View Pricing Plans
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="font-inter text-xs text-ink-black opacity-50">
            © 2025 ComicScoutUK. Your comic collection, organized.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
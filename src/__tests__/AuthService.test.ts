import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../services/AuthService';
import * as supabaseClient from '../lib/supabaseClient';

// Mock the supabase client
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      refreshSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

const mockAuth = vi.mocked(supabaseClient.supabase.auth);

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000'
  },
  writable: true
});

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token', refresh_token: 'refresh', expires_in: 3600 };

      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      const result = await AuthService.register('test@example.com', 'password123');

      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should handle registration errors', async () => {
      const mockError = { message: 'User already exists', name: 'AuthError' };

      mockAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      });

      const result = await AuthService.register('test@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should handle unexpected errors', async () => {
      const mockError = new Error('Network error');
      mockAuth.signUp.mockRejectedValue(mockError);

      const result = await AuthService.register('test@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token', refresh_token: 'refresh', expires_in: 3600 };

      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      const result = await AuthService.login('test@example.com', 'password123');

      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should handle login errors', async () => {
      const mockError = { message: 'Invalid credentials', name: 'AuthError' };

      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      });

      const result = await AuthService.login('test@example.com', 'wrongpassword');

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null });

      const result = await AuthService.logout();

      expect(result.error).toBeNull();
      expect(mockAuth.signOut).toHaveBeenCalled();
    });

    it('should handle logout errors', async () => {
      const mockError = { message: 'Logout failed', name: 'AuthError' };
      mockAuth.signOut.mockResolvedValue({ error: mockError });

      const result = await AuthService.logout();

      expect(result.error).toEqual(mockError);
    });
  });

  describe('getCurrentSession', () => {
    it('should get current session successfully', async () => {
      const mockSession = { access_token: 'token', refresh_token: 'refresh', expires_in: 3600 };

      mockAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const result = await AuthService.getCurrentSession();

      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(mockAuth.getSession).toHaveBeenCalled();
    });

    it('should handle session errors', async () => {
      const mockError = { message: 'Session expired', name: 'AuthError' };

      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError
      });

      const result = await AuthService.getCurrentSession();

      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await AuthService.getCurrentUser();

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(mockAuth.getUser).toHaveBeenCalled();
    });
  });

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'new-token', refresh_token: 'new-refresh', expires_in: 3600 };

      mockAuth.refreshSession.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      const result = await AuthService.refreshSession();

      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(mockAuth.refreshSession).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should send reset password email successfully', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValue({ error: null });

      const result = await AuthService.resetPassword('test@example.com');

      expect(result.error).toBeNull();
      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: 'http://localhost:3000/auth/reset-password'
      });
    });

    it('should handle reset password errors', async () => {
      const mockError = { message: 'User not found', name: 'AuthError' };
      mockAuth.resetPasswordForEmail.mockResolvedValue({ error: mockError });

      const result = await AuthService.resetPassword('test@example.com');

      expect(result.error).toEqual(mockError);
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      mockAuth.updateUser.mockResolvedValue({ error: null });

      const result = await AuthService.updatePassword('newpassword123');

      expect(result.error).toBeNull();
      expect(mockAuth.updateUser).toHaveBeenCalledWith({ password: 'newpassword123' });
    });

    it('should handle update password errors', async () => {
      const mockError = { message: 'Password update failed', name: 'AuthError' };
      mockAuth.updateUser.mockResolvedValue({ error: mockError });

      const result = await AuthService.updatePassword('newpassword123');

      expect(result.error).toEqual(mockError);
    });
  });

  describe('validation methods', () => {
    describe('validateEmail', () => {
      it('should validate correct email formats', () => {
        expect(AuthService.validateEmail('test@example.com')).toBe(true);
        expect(AuthService.validateEmail('user.name+tag@domain.co.uk')).toBe(true);
        expect(AuthService.validateEmail('simple@domain.org')).toBe(true);
      });

      it('should reject invalid email formats', () => {
        expect(AuthService.validateEmail('invalid')).toBe(false);
        expect(AuthService.validateEmail('invalid@')).toBe(false);
        expect(AuthService.validateEmail('@domain.com')).toBe(false);
        expect(AuthService.validateEmail('invalid@domain')).toBe(false);
        expect(AuthService.validateEmail('')).toBe(false);
      });
    });

    describe('validatePassword', () => {
      it('should validate valid passwords', () => {
        const result = AuthService.validatePassword('password123');
        expect(result.valid).toBe(true);
        expect(result.message).toBeUndefined();
      });

      it('should reject short passwords', () => {
        const result = AuthService.validatePassword('123');
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Password must be at least 6 characters long');
      });

      it('should validate minimum length passwords', () => {
        const result = AuthService.validatePassword('123456');
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('onAuthStateChange', () => {
    it('should setup auth state change listener', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      
      mockAuth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } }
      });

      const result = AuthService.onAuthStateChange(mockCallback);

      expect(mockAuth.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
      expect(result).toBeDefined();
    });
  });
});
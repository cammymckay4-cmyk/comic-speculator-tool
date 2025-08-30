import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler as registerHandler } from '../pages/api/auth/register';
import { handler as loginHandler } from '../pages/api/auth/login';
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
    },
  },
}));

const mockAuth = vi.mocked(supabaseClient.supabase.auth);

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete registration and login flow', () => {
    it('should successfully register and then login a user', async () => {
      const testEmail = 'integration@test.com';
      const testPassword = 'testpassword123';
      
      const mockUser = {
        id: 'user-integration-123',
        email: testEmail,
        email_confirmed_at: '2024-01-01T00:00:00Z'
      };

      const mockSession = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123',
        expires_at: 1704067200,
        expires_in: 3600
      };

      // Mock successful registration
      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      });

      // Test registration endpoint
      const registerRequest = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail, password: testPassword }),
        headers: { 'Content-Type': 'application/json' }
      });

      const registerResponse = await registerHandler(registerRequest);
      const registerData = await registerResponse.json();

      expect(registerResponse.status).toBe(201);
      expect(registerData.success).toBe(true);
      expect(registerData.user.email).toBe(testEmail);

      // Mock successful login
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      // Test login endpoint
      const loginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail, password: testPassword }),
        headers: { 'Content-Type': 'application/json' }
      });

      const loginResponse = await loginHandler(loginRequest);
      const loginData = await loginResponse.json();

      expect(loginResponse.status).toBe(200);
      expect(loginData.success).toBe(true);
      expect(loginData.user.email).toBe(testEmail);
      expect(loginData.session.access_token).toBe(mockSession.access_token);

      // Verify auth service calls
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: testEmail,
        password: testPassword
      });
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: testEmail,
        password: testPassword
      });
    });

    it('should handle registration failure gracefully', async () => {
      const testEmail = 'existing@test.com';
      const testPassword = 'testpassword123';

      // Mock registration failure (user already exists)
      mockAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered', name: 'AuthError', status: 400 }
      });

      const registerRequest = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail, password: testPassword }),
        headers: { 'Content-Type': 'application/json' }
      });

      const registerResponse = await registerHandler(registerRequest);
      const registerData = await registerResponse.json();

      expect(registerResponse.status).toBe(400);
      expect(registerData.success).toBe(false);
      expect(registerData.error).toBe('User already registered');

      // Verify user cannot login with unregistered credentials
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', name: 'AuthError', status: 400 }
      });

      const loginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail, password: testPassword }),
        headers: { 'Content-Type': 'application/json' }
      });

      const loginResponse = await loginHandler(loginRequest);
      const loginData = await loginResponse.json();

      expect(loginResponse.status).toBe(401);
      expect(loginData.success).toBe(false);
      expect(loginData.error).toBe('Invalid login credentials');
    });
  });

  describe('AuthService integration with API endpoints', () => {
    it('should maintain consistent behavior between service and endpoints', async () => {
      const testEmail = 'service@test.com';
      const testPassword = 'servicetest123';

      const mockUser = {
        id: 'user-service-123',
        email: testEmail,
        email_confirmed_at: '2024-01-01T00:00:00Z'
      };

      const mockSession = {
        access_token: 'service-token-123',
        refresh_token: 'service-refresh-123',
        expires_at: 1704067200,
        expires_in: 3600
      };

      // Mock for both service and endpoint calls
      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      });

      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      // Test AuthService directly
      const serviceRegisterResult = await AuthService.register(testEmail, testPassword);
      expect(serviceRegisterResult.user?.email).toBe(testEmail);
      expect(serviceRegisterResult.error).toBeNull();

      const serviceLoginResult = await AuthService.login(testEmail, testPassword);
      expect(serviceLoginResult.user?.email).toBe(testEmail);
      expect(serviceLoginResult.session?.access_token).toBe(mockSession.access_token);
      expect(serviceLoginResult.error).toBeNull();

      // Test API endpoints
      const registerRequest = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail, password: testPassword }),
        headers: { 'Content-Type': 'application/json' }
      });

      const registerResponse = await registerHandler(registerRequest);
      const registerData = await registerResponse.json();

      expect(registerData.user.email).toBe(testEmail);

      const loginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail, password: testPassword }),
        headers: { 'Content-Type': 'application/json' }
      });

      const loginResponse = await loginHandler(loginRequest);
      const loginData = await loginResponse.json();

      expect(loginData.user.email).toBe(testEmail);
      expect(loginData.session.access_token).toBe(mockSession.access_token);
    });
  });

  describe('Error handling consistency', () => {
    it('should handle network errors consistently across service and endpoints', async () => {
      const testEmail = 'error@test.com';
      const testPassword = 'errortest123';

      const networkError = new Error('Network connection failed');

      // Mock network error
      mockAuth.signUp.mockRejectedValue(networkError);
      mockAuth.signInWithPassword.mockRejectedValue(networkError);

      // Test AuthService error handling
      const serviceRegisterResult = await AuthService.register(testEmail, testPassword);
      expect(serviceRegisterResult.user).toBeNull();
      expect(serviceRegisterResult.error).toEqual(networkError);

      const serviceLoginResult = await AuthService.login(testEmail, testPassword);
      expect(serviceLoginResult.user).toBeNull();
      expect(serviceLoginResult.error).toEqual(networkError);

      // Test API endpoint error handling
      const registerRequest = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail, password: testPassword }),
        headers: { 'Content-Type': 'application/json' }
      });

      const registerResponse = await registerHandler(registerRequest);
      const registerData = await registerResponse.json();

      expect(registerResponse.status).toBe(500);
      expect(registerData.success).toBe(false);
      expect(registerData.error).toBe('Internal server error');

      const loginRequest = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: testEmail, password: testPassword }),
        headers: { 'Content-Type': 'application/json' }
      });

      const loginResponse = await loginHandler(loginRequest);
      const loginData = await loginResponse.json();

      expect(loginResponse.status).toBe(500);
      expect(loginData.success).toBe(false);
      expect(loginData.error).toBe('Internal server error');
    });
  });

  describe('Validation consistency', () => {
    it('should apply the same validation rules in service and endpoints', async () => {
      const invalidEmail = 'invalid-email';
      const shortPassword = '123';

      // Test AuthService validation
      expect(AuthService.validateEmail(invalidEmail)).toBe(false);
      expect(AuthService.validatePassword(shortPassword).valid).toBe(false);

      // Test endpoint validation
      const registerRequest = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: invalidEmail, password: shortPassword }),
        headers: { 'Content-Type': 'application/json' }
      });

      const registerResponse = await registerHandler(registerRequest);
      const registerData = await registerResponse.json();

      expect(registerResponse.status).toBe(400);
      expect(registerData.success).toBe(false);
      expect(registerData.error).toBe('Invalid email format');

      // Test password validation
      const passwordRequest = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'valid@test.com', password: shortPassword }),
        headers: { 'Content-Type': 'application/json' }
      });

      const passwordResponse = await registerHandler(passwordRequest);
      const passwordData = await passwordResponse.json();

      expect(passwordResponse.status).toBe(400);
      expect(passwordData.success).toBe(false);
      expect(passwordData.error).toBe('Password must be at least 6 characters long');
    });
  });
});
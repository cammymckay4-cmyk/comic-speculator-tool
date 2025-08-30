import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../pages/api/auth/login';
import * as supabaseClient from '../lib/supabaseClient';

// Mock the supabase client
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

const mockSignInWithPassword = vi.mocked(supabaseClient.supabase.auth.signInWithPassword);

describe('auth/login API endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 405 for non-POST requests', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'GET'
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(405);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Method not allowed');
  });

  it('should return 400 for invalid JSON', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: 'invalid json',
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid JSON in request body');
  });

  it('should return 400 when email is missing', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'test123' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Email and password are required');
  });

  it('should return 400 when password is missing', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Email and password are required');
  });

  it('should return 400 for invalid email format', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'invalid-email',
        password: 'test123' 
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid email format');
  });

  it('should successfully login a user', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      email_confirmed_at: '2024-01-01T00:00:00Z',
      last_sign_in_at: '2024-01-01T12:00:00Z'
    };

    const mockSession = {
      access_token: 'access-token-123',
      refresh_token: 'refresh-token-123',
      expires_at: 1704067200,
      expires_in: 3600
    };

    mockSignInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null
    });

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'test@example.com',
        password: 'test123456' 
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.id).toBe('user-123');
    expect(data.user.email).toBe('test@example.com');
    expect(data.session.access_token).toBe('access-token-123');
    expect(data.message).toBe('Login successful');
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'test123456'
    });
  });

  it('should return 401 for invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials', name: 'AuthError', status: 400 }
    });

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'test@example.com',
        password: 'wrongpassword' 
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid login credentials');
  });

  it('should return 400 for other auth errors', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Email not confirmed', name: 'AuthError', status: 400 }
    });

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'test@example.com',
        password: 'test123456' 
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Email not confirmed');
  });

  it('should handle unexpected errors', async () => {
    mockSignInWithPassword.mockRejectedValue(new Error('Network error'));

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'test@example.com',
        password: 'test123456' 
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Internal server error');
    expect(data.message).toBe('Network error');
  });

  it('should set appropriate headers', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      email_confirmed_at: '2024-01-01T00:00:00Z',
      last_sign_in_at: '2024-01-01T12:00:00Z'
    };

    const mockSession = {
      access_token: 'access-token-123',
      refresh_token: 'refresh-token-123',
      expires_at: 1704067200,
      expires_in: 3600
    };

    mockSignInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null
    });

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'test@example.com',
        password: 'test123456' 
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await handler(request);

    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
  });
});
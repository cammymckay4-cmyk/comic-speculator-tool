import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../pages/api/auth/register';
import * as supabaseClient from '../lib/supabaseClient';

// Mock the supabase client
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
  },
}));

const mockSignUp = vi.mocked(supabaseClient.supabase.auth.signUp);

describe('auth/register API endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 405 for non-POST requests', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'GET'
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(405);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Method not allowed');
  });

  it('should return 400 for invalid JSON', async () => {
    const request = new Request('http://localhost/api/auth/register', {
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
    const request = new Request('http://localhost/api/auth/register', {
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
    const request = new Request('http://localhost/api/auth/register', {
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
    const request = new Request('http://localhost/api/auth/register', {
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

  it('should return 400 for password too short', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'test@example.com',
        password: '123' 
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Password must be at least 6 characters long');
  });

  it('should successfully register a user with confirmed email', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      email_confirmed_at: '2024-01-01T00:00:00Z'
    };

    mockSignUp.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'test@example.com',
        password: 'test123456' 
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.user.id).toBe('user-123');
    expect(data.user.email).toBe('test@example.com');
    expect(data.message).toBe('Registration successful');
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'test123456'
    });
  });

  it('should successfully register a user with unconfirmed email', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      email_confirmed_at: null
    };

    mockSignUp.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ 
        email: 'test@example.com',
        password: 'test123456' 
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Registration successful. Please check your email to confirm your account.');
  });

  it('should handle supabase auth error', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered', name: 'AuthError', status: 400 }
    });

    const request = new Request('http://localhost/api/auth/register', {
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
    expect(data.error).toBe('User already registered');
  });

  it('should handle unexpected errors', async () => {
    mockSignUp.mockRejectedValue(new Error('Network error'));

    const request = new Request('http://localhost/api/auth/register', {
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
      email_confirmed_at: '2024-01-01T00:00:00Z'
    };

    mockSignUp.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });

    const request = new Request('http://localhost/api/auth/register', {
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
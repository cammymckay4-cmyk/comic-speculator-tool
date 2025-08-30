import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  getClientIP,
  getSecurityHeaders,
  applySecurityHeaders,
  applyRateLimit,
  getCORSHeaders
} from '../lib/middleware/security';

describe('Security Middleware', () => {
  describe('getClientIP', () => {
    it('should return IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 127.0.0.1'
        }
      });

      const result = getClientIP(request);
      expect(result).toBe('192.168.1.1');
    });

    it('should return IP from cf-connecting-ip header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'cf-connecting-ip': '203.0.113.1'
        }
      });

      const result = getClientIP(request);
      expect(result).toBe('203.0.113.1');
    });

    it('should return IP from x-real-ip header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-real-ip': '198.51.100.1'
        }
      });

      const result = getClientIP(request);
      expect(result).toBe('198.51.100.1');
    });

    it('should return null when no IP headers are present', () => {
      const request = new Request('http://localhost');

      const result = getClientIP(request);
      expect(result).toBeNull();
    });

    it('should prioritize x-forwarded-for over other headers', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'cf-connecting-ip': '203.0.113.1',
          'x-real-ip': '198.51.100.1'
        }
      });

      const result = getClientIP(request);
      expect(result).toBe('192.168.1.1');
    });
  });

  describe('getSecurityHeaders', () => {
    it('should return security headers without unsafe directives', () => {
      const headers = getSecurityHeaders();

      expect(headers).toHaveProperty('Content-Security-Policy');
      expect(headers).toHaveProperty('X-Frame-Options', 'DENY');
      expect(headers).toHaveProperty('X-Content-Type-Options', 'nosniff');
      expect(headers).toHaveProperty('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(headers).toHaveProperty('X-XSS-Protection', '1; mode=block');
      expect(headers).toHaveProperty('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      expect(headers).toHaveProperty('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    });

    it('should not include unsafe-eval in CSP', () => {
      const headers = getSecurityHeaders();
      
      expect(headers['Content-Security-Policy']).not.toContain('unsafe-eval');
    });

    it('should include unsafe-inline only for styles', () => {
      const headers = getSecurityHeaders();
      const csp = headers['Content-Security-Policy'];
      
      // Should not include unsafe-inline for scripts
      expect(csp).toMatch(/script-src[^;]*'self'/);
      expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
      
      // Should include unsafe-inline for styles (common requirement)
      expect(csp).toMatch(/style-src[^;]*'self'[^;]*'unsafe-inline'/);
    });
  });

  describe('applySecurityHeaders', () => {
    it('should apply security headers to response', () => {
      const response = new Response('test');
      const securedResponse = applySecurityHeaders(response);

      expect(securedResponse.headers.get('X-Frame-Options')).toBe('DENY');
      expect(securedResponse.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(securedResponse.headers.get('Content-Security-Policy')).toBeDefined();
    });
  });

  describe('checkRateLimit', () => {
    beforeEach(() => {
      // Clear rate limit store by creating a new instance
      vi.clearAllMocks();
    });

    it('should allow requests within rate limit', () => {
      const result = checkRateLimit('192.168.1.1', 60000, 100);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
    });

    it('should block requests exceeding rate limit', () => {
      const ip = '192.168.1.2';
      
      // Make 100 requests to reach the limit
      for (let i = 0; i < 100; i++) {
        checkRateLimit(ip, 60000, 100);
      }

      // 101st request should be blocked
      const result = checkRateLimit(ip, 60000, 100);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset rate limit after window expires', () => {
      const ip = '192.168.1.3';
      
      // Make requests to reach limit
      for (let i = 0; i < 100; i++) {
        checkRateLimit(ip, 1, 100); // 1ms window for quick test
      }

      // Wait for window to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = checkRateLimit(ip, 1, 100);
          expect(result.allowed).toBe(true);
          resolve(undefined);
        }, 2);
      });
    });
  });

  describe('applyRateLimit', () => {
    it('should return null for allowed requests', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.4'
        }
      });

      const result = applyRateLimit(request, 60000, 100);
      expect(result).toBeNull();
    });

    it('should return null when client IP cannot be determined', () => {
      const request = new Request('http://localhost');

      const result = applyRateLimit(request, 60000, 100);
      expect(result).toBeNull();
    });

    it('should return 429 response for rate limited requests', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.5'
        }
      });

      // Exhaust rate limit
      for (let i = 0; i < 100; i++) {
        applyRateLimit(request, 60000, 100);
      }

      // Next request should return 429
      const result = applyRateLimit(request, 60000, 100);
      expect(result).toBeInstanceOf(Response);
      expect(result?.status).toBe(429);
    });
  });

  describe('getCORSHeaders', () => {
    it('should allow known origins', () => {
      const headers = getCORSHeaders('http://localhost:3000');

      expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
      expect(headers['Access-Control-Allow-Methods']).toBe('GET, POST, PUT, DELETE, OPTIONS');
      expect(headers['Access-Control-Allow-Headers']).toBe('Content-Type, Authorization, X-Requested-With');
      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    });

    it('should fallback to production domain for unknown origins', () => {
      const headers = getCORSHeaders('https://malicious-site.com');

      expect(headers['Access-Control-Allow-Origin']).toBe('https://comic-speculator-tool.netlify.app');
    });

    it('should fallback to production domain when no origin provided', () => {
      const headers = getCORSHeaders();

      expect(headers['Access-Control-Allow-Origin']).toBe('https://comic-speculator-tool.netlify.app');
    });

    it('should allow all specified localhost origins', () => {
      const localhostOrigins = [
        'http://localhost:8080',
        'http://localhost:3000'
      ];

      localhostOrigins.forEach(origin => {
        const headers = getCORSHeaders(origin);
        expect(headers['Access-Control-Allow-Origin']).toBe(origin);
      });
    });

    it('should allow production domain', () => {
      const headers = getCORSHeaders('https://comic-speculator-tool.netlify.app');

      expect(headers['Access-Control-Allow-Origin']).toBe('https://comic-speculator-tool.netlify.app');
    });
  });
});
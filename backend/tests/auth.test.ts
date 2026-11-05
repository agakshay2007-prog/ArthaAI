import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from '../src/utils/token.js';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';
import http from 'http';

// Helper to make local HTTP requests against an ephemeral instance
const makeRequest = async (
  server: http.Server,
  options: {
    method: string;
    path: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
    cookies?: string;
  }
): Promise<{ status: number; body: Record<string, unknown>; headers: http.IncomingHttpHeaders }> => {
  const address = server.address() as { port: number };
  const port = address.port;

  return new Promise((resolve, reject) => {
    const postData = options.body ? JSON.stringify(options.body) : '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (options.cookies) {
      headers['Cookie'] = options.cookies;
    }

    if (options.body) {
      headers['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path: options.path,
        method: options.method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsedBody = {};
          try {
            parsedBody = JSON.parse(rawData);
          } catch {
            parsedBody = { raw: rawData };
          }
          resolve({
            status: res.statusCode || 500,
            body: parsedBody as Record<string, unknown>,
            headers: res.headers,
          });
        });
      }
    );

    req.on('error', reject);
    if (options.body) {
      req.write(postData);
    }
    req.end();
  });
};

describe('ArthaAI Phase 3 Authentication Test Suite', () => {
  let server: http.Server;

  before(async () => {
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => resolve());
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  // 1. Password Hashing and Comparison
  it('should hash passwords securely with bcrypt and verify matches', async () => {
    const rawPassword = 'SecurePassword123!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    assert.notEqual(rawPassword, hash);
    const isCorrect = await bcrypt.compare(rawPassword, hash);
    assert.equal(isCorrect, true);

    const isWrong = await bcrypt.compare('WrongPassword456', hash);
    assert.equal(isWrong, false);
  });

  // 2. JWT Generation and Signature Verification
  it('should generate valid JWT tokens and correctly verify payload', () => {
    const payload = { id: 'usr-demo-test-123', email: 'test@artha.ai' };
    const token = generateToken(payload);
    assert.ok(token);

    const decoded = verifyToken(token);
    assert.equal(decoded.id, payload.id);
    assert.equal(decoded.email, payload.email);
  });

  it('should reject tampered or invalid JWT signatures', () => {
    assert.throws(() => {
      verifyToken('invalid.tampered.token');
    });
  });

  // 3. Unauthorized Protected API Requests
  it('should reject requests to protected /api/auth/me without token (401)', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/auth/me',
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Authentication required/);
  });

  it('should reject requests with malformed Bearer authorization (401)', async () => {
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/auth/me',
      headers: {
        Authorization: 'Bearer invalid-token-string',
      },
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  // 4. Valid Authenticated Requests
  it('should allow access to /api/auth/me with valid Bearer token (200)', async () => {
    const token = generateToken({ id: 'usr-valid-999', email: 'verified@artha.ai' });
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/auth/me',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal((res.body.data as { user: { email: string } }).user.email, 'verified@artha.ai');
  });

  it('should allow access to /api/auth/me with valid HttpOnly cookie (200)', async () => {
    const token = generateToken({ id: 'usr-cookie-888', email: 'cookie.user@artha.ai' });
    const res = await makeRequest(server, {
      method: 'GET',
      path: '/api/auth/me',
      cookies: `${env.COOKIE_NAME}=${token}`,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal((res.body.data as { user: { email: string } }).user.email, 'cookie.user@artha.ai');
  });

  // 5. Logout Behavior
  it('should clear authentication cookie and return success on /api/auth/logout', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/auth/logout',
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    // Check Set-Cookie clears the cookie
    const setCookie = res.headers['set-cookie'];
    assert.ok(setCookie);
    const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    assert.match(cookieHeader, new RegExp(`${env.COOKIE_NAME}=`));
  });

  // 6. Request Validation Checks
  it('should reject registration with invalid email format (400)', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Test User',
        email: 'invalid-email-format',
        password: 'ValidPassword123!',
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /valid email/);
  });

  it('should reject registration with weak password (400)', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Test User',
        email: 'valid@artha.ai',
        password: 'weak',
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /at least 8 characters/);
  });

  it('should reject registration with missing full name (400)', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/auth/register',
      body: {
        email: 'valid@artha.ai',
        password: 'ValidPassword123!',
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Full name is required/);
  });

  it('should reject login with missing credentials (400)', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/auth/login',
      body: {},
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /credentials are required/);
  });

  // 7. MongoDB Unavailable Behavior
  it('should return 503 when registering with unconfigured MongoDB', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/auth/register',
      body: {
        fullName: 'Test User',
        email: 'test@artha.ai',
        password: 'ValidPassword123',
      },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Database service is currently unconfigured/);
  });

  it('should return 503 when logging in with unconfigured MongoDB', async () => {
    const res = await makeRequest(server, {
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: 'test@artha.ai',
        password: 'ValidPassword123',
      },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
    assert.match(String(res.body.message), /Database service is currently unconfigured/);
  });

  it('should return 503 when updating profile with unconfigured MongoDB', async () => {
    const token = generateToken({ id: 'usr-123', email: 'test@artha.ai' });
    const res = await makeRequest(server, {
      method: 'PATCH',
      path: '/api/auth/profile',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        fullName: 'Updated Name',
      },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
  });

  it('should return 503 when changing password with unconfigured MongoDB', async () => {
    const token = generateToken({ id: 'usr-123', email: 'test@artha.ai' });
    const res = await makeRequest(server, {
      method: 'PATCH',
      path: '/api/auth/change-password',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword456',
      },
    });

    assert.equal(res.status, 503);
    assert.equal(res.body.success, false);
  });
});

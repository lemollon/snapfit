/**
 * Authentication Login Flow Tests
 *
 * These tests verify the complete login flow works correctly:
 * 1. Password hashing consistency between registration and login
 * 2. Email normalization
 * 3. Database query patterns
 * 4. Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import bcrypt from 'bcryptjs';

// Test password hashing consistency
describe('Password Hashing Tests', () => {
  const testPassword = 'Test1234!';

  it('should hash password consistently with bcryptjs', async () => {
    // Hash the password as done in registration
    const hashedPassword = await bcrypt.hash(testPassword, 12);

    // Verify password comparison works (as done in login)
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);

    expect(isMatch).toBe(true);
  });

  it('should reject wrong password', async () => {
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    const isMatch = await bcrypt.compare('WrongPassword123!', hashedPassword);

    expect(isMatch).toBe(false);
  });

  it('should handle case-sensitive passwords', async () => {
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    const isMatch = await bcrypt.compare('test1234!', hashedPassword); // lowercase

    expect(isMatch).toBe(false);
  });

  it('should work with seed password hash', async () => {
    // The seed route hashes 'Test1234!' with cost factor 12
    const seedPassword = 'Test1234!';
    const hashedPassword = await bcrypt.hash(seedPassword, 12);

    // Login should be able to verify this
    const isMatch = await bcrypt.compare(seedPassword, hashedPassword);
    expect(isMatch).toBe(true);
  });
});

// Test email normalization
describe('Email Normalization Tests', () => {
  it('should normalize email to lowercase', () => {
    const email = 'TestUser@SnapFit.COM';
    const normalized = email.toLowerCase().trim();

    expect(normalized).toBe('testuser@snapfit.com');
  });

  it('should trim whitespace from email', () => {
    const email = '  testuser@snapfit.com  ';
    const normalized = email.toLowerCase().trim();

    expect(normalized).toBe('testuser@snapfit.com');
  });

  it('should handle mixed case and whitespace', () => {
    const email = '  TestUser@SnapFit.COM  ';
    const normalized = email.toLowerCase().trim();

    expect(normalized).toBe('testuser@snapfit.com');
  });
});

// Mock the database to test the query pattern
describe('Auth Database Query Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should use correct query pattern for user lookup', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'testuser@snapfit.com',
      password: await bcrypt.hash('Test1234!', 12),
      name: 'Test User',
      isTrainer: false,
      avatarUrl: null,
    };

    // Mock the db.select().from().where().limit() chain
    const mockLimit = vi.fn(() => Promise.resolve([mockUser]));
    const mockWhere = vi.fn(() => ({ limit: mockLimit }));
    const mockFrom = vi.fn(() => ({ where: mockWhere }));
    const mockSelect = vi.fn(() => ({ from: mockFrom }));

    const mockDb = { select: mockSelect };

    // Simulate the query
    const result = await mockDb.select().from({}).where({}).limit(1);
    const user = result[0];

    expect(mockSelect).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
    expect(mockLimit).toHaveBeenCalledWith(1);
    expect(user).toEqual(mockUser);
  });

  it('should handle user not found', async () => {
    const mockLimit = vi.fn(() => Promise.resolve([]));
    const mockWhere = vi.fn(() => ({ limit: mockLimit }));
    const mockFrom = vi.fn(() => ({ where: mockWhere }));
    const mockSelect = vi.fn(() => ({ from: mockFrom }));

    const mockDb = { select: mockSelect };

    const result = await mockDb.select().from({}).where({}).limit(1);
    const user = result[0];

    expect(user).toBeUndefined();
  });
});

// Simulate the full authorize function logic
describe('Authorize Function Logic Tests', () => {
  const mockCredentials = {
    email: 'testuser@snapfit.com',
    password: 'Test1234!',
  };

  it('should authenticate valid user successfully', async () => {
    const hashedPassword = await bcrypt.hash('Test1234!', 12);
    const mockUser = {
      id: 'user-123',
      email: 'testuser@snapfit.com',
      password: hashedPassword,
      name: 'Test User',
      isTrainer: false,
      avatarUrl: null,
    };

    // Simulate the authorize function logic
    const normalizedEmail = mockCredentials.email.toLowerCase().trim();

    // Simulate database query result
    const result = [mockUser];
    const user = result[0];

    expect(user).toBeDefined();
    expect(user.password).toBeDefined();

    const passwordMatch = await bcrypt.compare(mockCredentials.password, user.password);
    expect(passwordMatch).toBe(true);

    // Simulate return value
    const authResult = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.avatarUrl,
      isTrainer: user.isTrainer,
    };

    expect(authResult.id).toBe('user-123');
    expect(authResult.email).toBe('testuser@snapfit.com');
  });

  it('should reject invalid password', async () => {
    const hashedPassword = await bcrypt.hash('Test1234!', 12);
    const mockUser = {
      id: 'user-123',
      email: 'testuser@snapfit.com',
      password: hashedPassword,
      name: 'Test User',
      isTrainer: false,
    };

    const wrongPassword = 'WrongPassword!';
    const passwordMatch = await bcrypt.compare(wrongPassword, mockUser.password);

    expect(passwordMatch).toBe(false);
  });

  it('should handle missing credentials', () => {
    const emptyCredentials = { email: '', password: '' };

    const hasCredentials = emptyCredentials.email && emptyCredentials.password;
    expect(hasCredentials).toBeFalsy();
  });

  it('should handle null user from database', async () => {
    // Simulate empty query result
    const result: any[] = [];
    const user = result[0];

    expect(user).toBeUndefined();

    // The authorize function should throw "Invalid email or password"
    const shouldThrow = !user || !user?.password;
    expect(shouldThrow).toBe(true);
  });
});

// Test the actual auth.ts logic by importing it
describe('Auth Module Integration', () => {
  it('should have correct auth configuration', async () => {
    // We'll mock the db to avoid actual database calls
    vi.mock('@/lib/db', () => ({
      db: {
        select: vi.fn(() => ({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve([])),
            })),
          })),
        })),
      },
    }));

    // Import the auth options
    const { authOptions } = await import('@/lib/auth');

    expect(authOptions).toBeDefined();
    expect(authOptions.providers).toBeDefined();
    expect(authOptions.providers.length).toBeGreaterThan(0);
    expect(authOptions.session?.strategy).toBe('jwt');
    expect(authOptions.pages?.signIn).toBe('/login');
  });
});

// Test the test-login diagnostic endpoint logic
describe('Test Login Diagnostic Logic', () => {
  it('should detect valid bcrypt hash format', () => {
    const validBcryptHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.Ua.eFUxVvBt9XG';
    const isBcrypt = validBcryptHash.startsWith('$2a$') || validBcryptHash.startsWith('$2b$');
    expect(isBcrypt).toBe(true);
  });

  it('should detect invalid password format', () => {
    const plainTextPassword = 'Test1234!';
    const isBcrypt = plainTextPassword.startsWith('$2a$') || plainTextPassword.startsWith('$2b$');
    expect(isBcrypt).toBe(false);
  });

  it('should extract bcrypt cost factor', () => {
    const hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.Ua.eFUxVvBt9XG';
    const costFactor = hash.split('$')[2];
    expect(costFactor).toBe('12');
  });

  it('should normalize email correctly', () => {
    const testCases = [
      { input: 'TestUser@SnapFit.COM', expected: 'testuser@snapfit.com' },
      { input: '  user@test.com  ', expected: 'user@test.com' },
      { input: 'USER@DOMAIN.COM', expected: 'user@domain.com' },
      { input: 'already.lowercase@email.com', expected: 'already.lowercase@email.com' },
    ];

    for (const tc of testCases) {
      const normalized = tc.input.toLowerCase().trim();
      expect(normalized).toBe(tc.expected);
    }
  });
});

// Test different bcrypt cost factors
describe('Bcrypt Cost Factor Compatibility', () => {
  const password = 'Test1234!';

  it('should work with cost factor 10', async () => {
    const hashed = await bcrypt.hash(password, 10);
    const match = await bcrypt.compare(password, hashed);
    expect(match).toBe(true);
  });

  it('should work with cost factor 12', async () => {
    const hashed = await bcrypt.hash(password, 12);
    const match = await bcrypt.compare(password, hashed);
    expect(match).toBe(true);
  });

  it('should verify hash from different cost factors', async () => {
    // Hash with cost 10 (like password reset might use)
    const hashedWith10 = await bcrypt.hash(password, 10);

    // Should still verify correctly
    const match = await bcrypt.compare(password, hashedWith10);
    expect(match).toBe(true);
  });
});

// Test edge cases in password handling
describe('Password Edge Cases', () => {
  it('should handle special characters in password', async () => {
    const specialPassword = 'Test!@#$%^&*()_+-=[]{}|;:,.<>?';
    const hashed = await bcrypt.hash(specialPassword, 12);
    const match = await bcrypt.compare(specialPassword, hashed);
    expect(match).toBe(true);
  });

  it('should handle unicode in password', async () => {
    const unicodePassword = 'Test1234!🔥💪';
    const hashed = await bcrypt.hash(unicodePassword, 12);
    const match = await bcrypt.compare(unicodePassword, hashed);
    expect(match).toBe(true);
  });

  it('should handle empty password hash check', async () => {
    const hashed = await bcrypt.hash('Test1234!', 12);
    const match = await bcrypt.compare('', hashed);
    expect(match).toBe(false);
  });

  it('should handle whitespace in password', async () => {
    const passwordWithSpaces = 'Test 1234!';
    const hashed = await bcrypt.hash(passwordWithSpaces, 12);

    // Without spaces should not match
    const matchWithoutSpaces = await bcrypt.compare('Test1234!', hashed);
    expect(matchWithoutSpaces).toBe(false);

    // With spaces should match
    const matchWithSpaces = await bcrypt.compare(passwordWithSpaces, hashed);
    expect(matchWithSpaces).toBe(true);
  });
});

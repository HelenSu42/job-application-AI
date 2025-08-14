import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import argon2 from 'argon2';

describe('authenticateUser', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('authenticates with Argon2id when passwordPepper is present and creates a session', async () => {
    await vi.doMock('../user/db', () => ({ userDB: { queryRow: vi.fn(), exec: vi.fn() } }));
    await vi.doMock('./db', () => ({ authDB: { exec: vi.fn() } }));
    await vi.doMock('encore.dev/config', () => ({ secret: () => () => 'PEPPER' }));

    const email = 'user@example.com';
    const password = 'Str0ngP@ss';
    const storedHash = await argon2.hash(password + 'PEPPER', { type: argon2.argon2id, timeCost: 3, memoryCost: 65536, parallelism: 1 });

    const { userDB } = await import('../user/db');
    const { authDB } = await import('./db');

    (userDB.queryRow as any).mockImplementation((strings: TemplateStringsArray) => {
      const sql = strings.join('');
      if (sql.includes('SELECT id, name, email, password_hash FROM users')) {
        return { id: 123, name: 'User', email, password_hash: storedHash };
      }
      return null;
    });

    const { authenticateUser } = await import('./login');

    const resp = await authenticateUser({ email, password });

    expect(resp.user.id).toBe(123);
    expect(resp.user.email).toBe(email);
    expect(resp.sessionToken).toMatch(/^[a-f0-9]{64}$/);
    expect((authDB.exec as any)).toHaveBeenCalledTimes(1);
  });

  it('authenticates when passwordPepper is absent (fallback) and creates a session', async () => {
    await vi.doMock('../user/db', () => ({ userDB: { queryRow: vi.fn(), exec: vi.fn() } }));
    await vi.doMock('./db', () => ({ authDB: { exec: vi.fn() } }));
    await vi.doMock('encore.dev/config', () => ({ secret: () => { throw new Error('no secret'); } }));

    const email = 'user2@example.com';
    const password = 'An0therP@ss';
    const storedHash = await argon2.hash(password + '', { type: argon2.argon2id, timeCost: 3, memoryCost: 65536, parallelism: 1 });

    const { userDB } = await import('../user/db');
    const { authDB } = await import('./db');

    (userDB.queryRow as any).mockImplementation((strings: TemplateStringsArray) => {
      const sql = strings.join('');
      if (sql.includes('SELECT id, name, email, password_hash FROM users')) {
        return { id: 456, name: 'User2', email, password_hash: storedHash };
      }
      return null;
    });

    const { authenticateUser } = await import('./login');

    const resp = await authenticateUser({ email, password });

    expect(resp.user.id).toBe(456);
    expect(resp.user.email).toBe(email);
    expect(resp.sessionToken).toMatch(/^[a-f0-9]{64}$/);
    expect((authDB.exec as any)).toHaveBeenCalledTimes(1);
  });

  it('supports legacy SHA-256 hashes and upgrades to Argon2id', async () => {
    await vi.doMock('../user/db', () => ({ userDB: { queryRow: vi.fn(), exec: vi.fn() } }));
    await vi.doMock('./db', () => ({ authDB: { exec: vi.fn() } }));
    await vi.doMock('encore.dev/config', () => ({ secret: () => () => 'PEPPER' }));

    const email = 'legacy@example.com';
    const password = 'OldPass123';
    const legacyHash = crypto.createHash('sha256').update(password).digest('hex');

    const { userDB } = await import('../user/db');
    const { authDB } = await import('./db');

    (userDB.queryRow as any).mockImplementation((strings: TemplateStringsArray) => {
      const sql = strings.join('');
      if (sql.includes('SELECT id, name, email, password_hash FROM users')) {
        return { id: 789, name: 'Legacy', email, password_hash: legacyHash };
      }
      return null;
    });

    const { authenticateUser } = await import('./login');

    const resp = await authenticateUser({ email, password });

    expect(resp.user.id).toBe(789);
    expect((userDB.exec as any)).toHaveBeenCalledTimes(1);
    expect((authDB.exec as any)).toHaveBeenCalledTimes(1);
  });
});
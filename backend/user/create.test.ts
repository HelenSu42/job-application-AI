import { describe, it, expect, vi, beforeEach } from 'vitest';
import argon2 from 'argon2';

describe('createUserAccount', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('hashes password with Argon2id and pepper when secret is present', async () => {
    const captured: { insertedHash?: string } = {};

    await vi.doMock('./db', () => ({ userDB: { queryRow: vi.fn((strings: TemplateStringsArray, ...values: any[]) => {
      const sql = strings.join('');
      if (sql.includes('SELECT id FROM users WHERE email')) {
        return null; // no existing user
      }
      if (sql.includes('INSERT INTO users')) {
        captured.insertedHash = values[2];
        return {
          id: 1,
          email: values[0],
          name: values[1],
          phone: null,
          location: null,
          currentSalary: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    }) } }));
    await vi.doMock('encore.dev/config', () => ({ secret: () => () => 'PEPPER' }));

    const { createUserAccount } = await import('./create');

    const req = { email: 'a@b.com', name: 'Alice', password: 'P@ssw0rd!' };
    const user = await createUserAccount(req);

    expect(user.email).toBe('a@b.com');
    expect(typeof captured.insertedHash).toBe('string');
    const ok = await argon2.verify(captured.insertedHash!, req.password + 'PEPPER', { type: argon2.argon2id });
    expect(ok).toBe(true);
  });

  it('hashes password without pepper when secret is absent', async () => {
    const captured: { insertedHash?: string } = {};

    await vi.doMock('./db', () => ({ userDB: { queryRow: vi.fn((strings: TemplateStringsArray, ...values: any[]) => {
      const sql = strings.join('');
      if (sql.includes('SELECT id FROM users WHERE email')) {
        return null;
      }
      if (sql.includes('INSERT INTO users')) {
        captured.insertedHash = values[2];
        return {
          id: 2,
          email: values[0],
          name: values[1],
          phone: null,
          location: null,
          currentSalary: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    }) } }));
    await vi.doMock('encore.dev/config', () => ({ secret: () => { throw new Error('no secret'); } }));

    const { createUserAccount } = await import('./create');

    const req = { email: 'b@b.com', name: 'Bob', password: 'S3cret!' };
    const user = await createUserAccount(req);

    expect(user.email).toBe('b@b.com');
    expect(typeof captured.insertedHash).toBe('string');
    const ok = await argon2.verify(captured.insertedHash!, req.password + '', { type: argon2.argon2id });
    expect(ok).toBe(true);
  });
});
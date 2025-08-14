import { vi } from 'vitest';

// Minimal stub for encore.dev/api to avoid requiring the Encore runtime in unit tests
vi.mock('encore.dev/api', () => {
  class APIError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode: number) {
      super(message);
      this.code = code;
      this.statusCode = statusCode;
    }
    static alreadyExists(message: string) {
      return new APIError(message, 'already_exists', 409);
    }
    static unauthenticated(message: string) {
      return new APIError(message, 'unauthenticated', 401);
    }
    static internal(message: string) {
      return new APIError(message, 'internal', 500);
    }
  }
  const api = <Req, Res>(_def: any, handler: (req: Req) => Promise<Res>) => handler;
  return { APIError, api };
});
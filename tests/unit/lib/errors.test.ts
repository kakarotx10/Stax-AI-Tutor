import {
  AppError,
  ValidationError,
  AuthError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
} from '@/src/lib/errors';

describe('AppError hierarchy', () => {
  it('AppError has defaults', () => {
    const err = new AppError('boom');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.isOperational).toBe(true);
  });

  it('ValidationError → 400', () => {
    const err = new ValidationError('bad input');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
  });

  it('AuthError → 401', () => {
    expect(new AuthError().statusCode).toBe(401);
  });

  it('NotFoundError → 404 with resource name', () => {
    const err = new NotFoundError('User');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('User not found');
  });

  it('ConflictError → 409', () => {
    expect(new ConflictError().statusCode).toBe(409);
  });

  it('RateLimitError → 429', () => {
    expect(new RateLimitError().statusCode).toBe(429);
  });

  it('ExternalServiceError → 502 with service name', () => {
    const err = new ExternalServiceError('Gemini');
    expect(err.statusCode).toBe(502);
    expect(err.message).toContain('Gemini');
  });
});

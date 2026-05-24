import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { AuthError } from './errors';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role?: string;
}

export function signToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
  options?: SignOptions
): string {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN,
    ...options,
  } as SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET as string) as TokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token expired');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Invalid token');
    }
    throw new AuthError('Token verification failed');
  }
}

export function decodeToken(token: string): TokenPayload | null {
  return jwt.decode(token) as TokenPayload | null;
}

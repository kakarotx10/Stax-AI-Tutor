import { connectDB } from '@/src/lib/db';
import { User, type IUser } from '@/src/models';
import {
  signupSchema,
  loginSchema,
  type SignupDto,
  type LoginDto,
} from '@/src/validators/auth.validator';
import {
  ValidationError,
  ConflictError,
  AuthError,
} from '@/src/lib/errors';
import { childLogger } from '@/src/lib/logger';

const log = childLogger('auth.controller');

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

function toPublicUser(user: IUser): PublicUser {
  return {
    id: user._id?.toString() ?? '',
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
  };
}

export async function signup(input: unknown): Promise<PublicUser> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError('Signup validation failed', parsed.error.flatten());
  }
  const dto: SignupDto = parsed.data;

  await connectDB();

  const existing = await User.findOne({ email: dto.email }).lean();
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const user = await User.create({
    email: dto.email,
    name: dto.name,
    passwordHash: dto.password, // pre-save hook hashes it
  });

  log.info({ userId: user._id }, 'New user signed up');
  return toPublicUser(user);
}

export async function login(input: unknown): Promise<PublicUser> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError('Login validation failed', parsed.error.flatten());
  }
  const dto: LoginDto = parsed.data;

  await connectDB();

  const user = await User.findOne({ email: dto.email }).select('+passwordHash');
  if (!user) throw new AuthError('Invalid email or password');

  const ok = await user.comparePassword(dto.password);
  if (!ok) throw new AuthError('Invalid email or password');

  const now = new Date();
  await User.updateOne(
    { _id: user._id },
    {
      $inc: { loginCount: 1 },
      $set: {
        lastLoginAt: now,
        lastActiveAt: now,
        'stats.lastActiveAt': now,
      },
    }
  );

  log.info({ userId: user._id }, 'User logged in');
  return toPublicUser(user);
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  await connectDB();
  const user = await User.findById(id);
  return user ? toPublicUser(user) : null;
}

import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../app';

export interface JWTPayload {
  userId: string;
  phoneNumber: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  const secret: Secret = env.JWT_SECRET as unknown as Secret;
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const secret: Secret = env.JWT_SECRET as unknown as Secret;
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};

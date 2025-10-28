import jwt from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET || 'default-secret-change-this';
const REFRESH_TOKEN_SECRET: string =
  process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret-change-this';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN: string = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
}

export function getRefreshTokenExpiry(): Date {
  const expiresIn = REFRESH_TOKEN_EXPIRES_IN;
  const days = parseInt(expiresIn.replace('d', ''));
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

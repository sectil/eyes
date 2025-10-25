import { TRPCError } from '@trpc/server';
import { verifyAccessToken } from '../utils/jwt';
import { Context } from '../types';

export function authMiddleware(ctx: Context) {
  const authHeader = ctx.req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No authorization token provided',
    });
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyAccessToken(token);
    return {
      user: payload,
    };
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
  }
}

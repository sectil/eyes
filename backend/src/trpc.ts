import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './types';
import { authMiddleware } from './middleware/auth';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { user } = authMiddleware(opts.ctx);

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      user,
    },
  });
});

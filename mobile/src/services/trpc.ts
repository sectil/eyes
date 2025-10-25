import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/types';
import { getStoredTokens } from './storage';

export const trpc = createTRPCReact<AppRouter>();

export function getTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${process.env.API_URL || 'http://localhost:3000'}/trpc`,
        async headers() {
          const tokens = await getStoredTokens();
          if (tokens?.accessToken) {
            return {
              authorization: `Bearer ${tokens.accessToken}`,
            };
          }
          return {};
        },
      }),
    ],
  });
}

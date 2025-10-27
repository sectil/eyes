import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import Constants from 'expo-constants';
import type { AppRouter } from '@/types';
import { getStoredTokens } from './storage';

export const trpc = createTRPCReact<AppRouter>();

export function getTRPCClient() {
  // Hardcoded API URL for now - TODO: fix Constants loading
  const apiUrl = 'http://192.168.1.12:3000';

  console.log('=== TRPC CLIENT DEBUG ===');
  console.log('API URL:', apiUrl);
  console.log('Full TRPC URL:', `${apiUrl}/trpc`);

  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${apiUrl}/trpc`,
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

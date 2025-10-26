import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, getTRPCClient } from './src/services/trpc';
import { useAuthStore } from './src/store/authStore';
import AppNavigator from './src/navigation/AppNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});
const trpcClient = getTRPCClient();

export default function App() {
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <PaperProvider>
            <AppNavigator />
          </PaperProvider>
        </trpc.Provider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

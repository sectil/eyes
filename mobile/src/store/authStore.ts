import { create } from 'zustand';
import { User, AuthTokens } from '@/types';
import { storeTokens, getStoredTokens, clearTokens } from '@/services/storage';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => Promise<void>;
  login: (user: User, tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setTokens: async (tokens) => {
    if (tokens) {
      await storeTokens(tokens);
    } else {
      await clearTokens();
    }
    set({ tokens });
  },

  login: async (user, tokens) => {
    await storeTokens(tokens);
    set({
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    await clearTokens();
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
    });
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });
    const storedTokens = await getStoredTokens();
    if (storedTokens) {
      set({
        tokens: storedTokens,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },
}));

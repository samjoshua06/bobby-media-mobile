import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role_id: number; // 1 = admin, 2 = customer, 3 = photographer
  referral_code?: string;
  profile_image?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  // ── Load token from SecureStore on app start ───────────────
  loadFromStorage: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        const { data } = await authApi.me();
        set({ user: data.data, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await SecureStore.deleteItemAsync('access_token');
      set({ isLoading: false });
    }
  },

  // ── Login ──────────────────────────────────────────────────
  login: async (email, password) => {
    const { data } = await authApi.login({ email, password });
    const { access_token, refresh_token, user } = data.data;
    await SecureStore.setItemAsync('access_token', access_token);
    if (refresh_token) await SecureStore.setItemAsync('refresh_token', refresh_token);
    set({ user, token: access_token, isAuthenticated: true });
  },

  // ── Logout ─────────────────────────────────────────────────
  logout: async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));

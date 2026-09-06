import { create } from 'zustand';
import type { User } from '../types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
    accessToken: string | null;
    user: User | null;
    status: AuthStatus;
    setAuth: (token: string, user: User) => void;
    setUser: (user: User) => void;
    clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    user: null,
    status: 'loading',
    setAuth: (accessToken, user) => set({ accessToken, user, status: 'authenticated' }),
    setUser: (user) => set({ user }),
    clear: () => set({ accessToken: null, user: null, status: 'unauthenticated' }),
}));
import { create } from 'zustand';
import type { User } from '../types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
    user: User | null;
    status: AuthStatus;
    setUser: (user: User) => void;
    clear: () => void;
}

// Access & refresh token đều nằm trong httpOnly cookie (backend quản lý).
// Store chỉ giữ thông tin user + trạng thái đăng nhập.
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    status: 'loading',
    setUser: (user) => set({ user, status: 'authenticated' }),
    clear: () => set({ user: null, status: 'unauthenticated' }),
}));

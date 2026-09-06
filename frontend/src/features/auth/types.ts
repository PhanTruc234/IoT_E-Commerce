export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    avatarUrl: string | null;
    role: Role;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

export interface RegisterPayload {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
}
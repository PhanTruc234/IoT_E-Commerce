export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    address: string | null;
    avatarUrl: string | null;
    role: Role;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
}

export interface RegisterPayload {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    acceptTerms: boolean;
}

export interface LoginSession {
    id: string;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: string;
    expiresAt: string;
    current: boolean;
}
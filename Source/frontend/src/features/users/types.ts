export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface AdminUser {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    role: UserRole;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: string;
    _count: { orders: number };
}

export interface AdminUserList {
    data: AdminUser[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}

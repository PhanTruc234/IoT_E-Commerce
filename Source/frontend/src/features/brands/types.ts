export interface Brand {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface BrandListResponse {
    data: Brand[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}
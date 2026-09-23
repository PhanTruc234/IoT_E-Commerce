export type SpecDataType = 'TEXT' | 'NUMBER' | 'BOOLEAN';

export interface Specification {
    id: string;
    name: string;
    unit: string | null;
    dataType: SpecDataType;
    createdAt?: string;
}

export interface SpecListResponse {
    data: Specification[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ProductSpecification {
    id: string;
    productId: string;
    specificationId: string;
    value: string;
    specification: Specification;
}
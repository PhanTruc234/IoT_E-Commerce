import { apiClient } from '@/shared/lib/api-client';
import type {
    CompareResult,
    Product,
    ProductDetail,
    ProductListResponse,
    ProductSortKey,
    ProductStatus,
    ProductType,
    PublicProductParams,
} from '../types';

export interface ProductListParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    status?: ProductStatus;
    sort?: ProductSortKey;
}

export interface CreateProductPayload {
    categoryId: string;
    brandId?: string;
    name: string;
    description?: string;
    price: number;
    salePrice?: number;
    stockQuantity?: number;
    status?: ProductStatus;
    type?: ProductType;
}
export type UpdateProductPayload = Partial<CreateProductPayload>;

export const productsApi = {
    listAdmin: (params: ProductListParams) =>
        apiClient.get<ProductListResponse>('/products/admin', { params }).then((r) => r.data),
    getAdmin: (id: string) =>
        apiClient.get<ProductDetail>(`/products/${id}`).then((r) => r.data),
    create: (payload: CreateProductPayload) =>
        apiClient.post<Product>('/products', payload).then((r) => r.data),
    update: (id: string, payload: UpdateProductPayload) =>
        apiClient.patch<Product>(`/products/${id}`, payload).then((r) => r.data),
    remove: (id: string) =>
        apiClient.delete<{ message: string }>(`/products/${id}`).then((r) => r.data),
    listPublic: (params: PublicProductParams) =>
        apiClient.get<ProductListResponse>('/products', { params }).then((r) => r.data),
    compare: (ids: string[]) =>
        apiClient.get<CompareResult>('/products/compare', { params: { ids: ids.join(',') } }).then((r) => r.data),
};
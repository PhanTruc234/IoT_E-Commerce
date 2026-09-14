export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
export type ProductType = 'SIMPLE' | 'VARIABLE' | 'COMBO';
export type ProductSortKey = 'newest' | 'price_asc' | 'price_desc' | 'best_selling';

export interface Product {
    id: string;
    categoryId: string;
    brandId: string | null;
    sku: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    salePrice: number | null;
    stockQuantity: number;
    status: ProductStatus;
    type: ProductType;
    viewCount: number;
    soldCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductImage {
    id: string;
    imageUrl: string;
    sortOrder: number;
    isPrimary: boolean;
}

export interface ProductListItem {
    id: string;
    sku: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    stockQuantity: number;
    status: ProductStatus;
    type: ProductType;
    category: { id: string; name: string; slug: string } | null;
    brand: { id: string; name: string; slug: string } | null;
    images: { imageUrl: string }[];
    createdAt: string;
}

export interface ProductListResponse {
    data: ProductListItem[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}
export interface ProductDetail extends Product {
    category: {
        id: string;
        name: string;
        slug: string
    } | null;
    brand: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null
    } | null;
    images: ProductImage[];
}
export interface AttributeOption {
    id: string;
    value: string;
    sortOrder: number;
}
export interface ProductAttribute {
    id: string;
    productId: string;
    name: string;
    isVariant: boolean;
    sortOrder: number;
    options: AttributeOption[];
}
export interface VariantOptionLink {
    id: string;
    optionId: string;
    option: { id: string; value: string; attribute: { id: string; name: string } };
}
export interface ProductVariant {
    id: string;
    productId: string;
    sku: string;
    price: number;
    salePrice: number | null;
    stockQuantity: number;
    imageUrl: string | null;
    isActive: boolean;
    options: VariantOptionLink[];
}

export interface ComboItemLine {
    id: string;
    quantity: number;
    unitPrice: number;
    stock: number;
    variantId: string | null;
    variantLabel: string | null;
    product: { id: string; name: string; slug: string; image: string | null };
}
export interface ComboSummary {
    comboPrice: number;
    originalPrice: number;
    saving: number;
    availableStock: number;
    items: ComboItemLine[];
}

export interface ComboItemInput {
    productId: string;
    variantId?: string;
    quantity: number;
}

export interface PublicProductParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: ProductSortKey;
}

export interface CategoryOption {
    id: string;
    label: string;
    level: number;
    isLeaf: boolean;
}

export interface SpecValue {
    id: string;
    value: string;
    specification: { id: string; name: string; unit: string | null };
}
export interface PublicProductDetail {
    id: string;
    sku: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    salePrice: number | null;
    stockQuantity: number;
    status: ProductStatus;
    type: ProductType;
    viewCount: number;
    soldCount: number;
    category: { id: string; name: string; slug: string } | null;
    brand: { id: string; name: string; slug: string; logoUrl: string | null } | null;
    images: ProductImage[];
    specifications: SpecValue[];
    attributes: ProductAttribute[];
    variants: ProductVariant[];
}
export interface CompareResult {
    products: {
        id: string;
        name: string;
        slug: string;
        price: number;
        salePrice: number | null;
        brand: string | null;
        image: string | null
    }[];
    specs: {
        specificationId: string;
        name: string;
        unit: string | null;
        values: Record<string, string>
    }[];
}
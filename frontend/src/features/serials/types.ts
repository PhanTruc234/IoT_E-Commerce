export type SerialStatus = 'IN_STOCK' | 'ACTIVATED';
export type WarrantyState = 'INACTIVE' | 'ACTIVE' | 'EXPIRED';

export interface SerialRow {
    id: string;
    code: string;
    productName: string;
    variantLabel: string | null;
    status: SerialStatus;
    warrantyMonths: number;
    sku: string;
    orderId: string | null;
    orderCode: string | null;
    activatedAt: string | null;
    warrantyEndAt: string | null;
    ownerName: string | null;
    ownerPhone: string | null;
    createdAt: string;
    state: WarrantyState;
    daysRemaining: number | null;
}
export interface SerialListResponse {
    data: SerialRow[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}
export type WarrantyLookup =
    | { found: false }
    | {
        found: true;
        code: string;
        product: { name: string; slug: string; image: string | null };
        variantLabel: string | null;
        warrantyMonths: number;
        activatedAt: string | null;
        warrantyEndAt: string | null;
        state: WarrantyState;
        daysRemaining: number | null;
    };
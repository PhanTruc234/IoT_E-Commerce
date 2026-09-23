import type { WarrantyState } from './types';
import type { SerialStatus } from './types';
export const WARRANTY_STATE: Record<WarrantyState, { label: string; color: 'gray' | 'green' | 'red' }> = {
    INACTIVE: { label: 'Chưa kích hoạt', color: 'gray' },
    ACTIVE: { label: 'Còn bảo hành', color: 'green' },
    EXPIRED: { label: 'Hết bảo hành', color: 'red' },
};


export const SERIAL_STATUS: Record<SerialStatus, { label: string; color: 'gray' | 'blue' }> = {
    IN_STOCK: { label: 'Trong kho', color: 'gray' },
    ACTIVATED: { label: 'Đã bán', color: 'blue' },
};
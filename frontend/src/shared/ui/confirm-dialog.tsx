'use client';
import { Modal } from './modal';
import { Button } from './button';

export function ConfirmDialog({
    open, title, message, error, confirmText = 'Xóa', loading, onConfirm, onClose,
}: {
    open: boolean; title: string; message: string; error?: string;
    confirmText?: string; loading?: boolean; onConfirm: () => void; onClose: () => void;
}) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <Button variant="secondary" type="button" onClick={onClose}>Hủy</Button>
                    <Button variant="danger" type="button" onClick={onConfirm} disabled={loading}>
                        {loading ? 'Đang xử lý…' : confirmText}
                    </Button>
                </>
            }
        >
            <p className="text-sm text-gray-600">{message}</p>
            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </Modal>
    );
}
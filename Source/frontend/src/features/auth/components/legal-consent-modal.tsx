'use client';
import Link from 'next/link';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { getPolicy } from '@/shared/config/policies';

export function LegalConsentModal({ onCancel, onAgree, loading }: { onCancel: () => void; onAgree: () => void; loading?: boolean }) {
    const terms = getPolicy('terms');
    const privacy = getPolicy('privacy');
    return (
        <Modal open onClose={onCancel} title="Xác nhận điều khoản"
            footer={<>
                <Button variant="secondary" type="button" onClick={onCancel}>Hủy</Button>
                <Button type="button" onClick={onAgree} disabled={loading}>
                    {loading ? 'Đang tạo tài khoản…' : 'Đồng ý & tiếp tục'}
                </Button>
            </>}>
            <div className="space-y-3 text-sm text-gray-700">
                <p>Để tạo tài khoản, bạn cần đồng ý với:</p>
                <ul className="space-y-1.5">
                    <li>
                        • <Link href="/legal/terms" target="_blank" className="font-medium text-blue-600 hover:underline">{terms?.title}</Link>
                        <span className="ml-1 text-xs text-gray-400">(v{terms?.version})</span>
                    </li>
                    <li>
                        • <Link href="/legal/privacy" target="_blank" className="font-medium text-blue-600 hover:underline">{privacy?.title}</Link>
                        <span className="ml-1 text-xs text-gray-400">(v{privacy?.version})</span>
                    </li>
                </ul>
                <p className="text-xs text-gray-500">Bấm “Đồng ý & tiếp tục” nghĩa là bạn đã đọc và chấp nhận các điều khoản trên. Bạn có thể xem chi tiết bằng cách bấm vào từng liên kết.</p>
            </div>
        </Modal>
    );
}
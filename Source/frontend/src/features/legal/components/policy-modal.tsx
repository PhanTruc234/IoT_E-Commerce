'use client';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { getPolicy } from '@/shared/config/policies';
import { PolicyBody } from './policy-body';

export function PolicyModal({ slug, onClose }: { slug: string; onClose: () => void }) {
    const doc = getPolicy(slug);
    if (!doc) return null;
    return (
        <Modal open onClose={onClose} title={doc.title} size="lg"
            footer={<Button type="button" onClick={onClose}>Đã hiểu</Button>}>
            <PolicyBody doc={doc} />
        </Modal>
    );
}
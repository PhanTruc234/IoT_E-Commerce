'use client';
import { AttributeEditor } from './attribute-editor';
import { VariantManager } from './variant-manager';

export function VariantsTab({ productId }: { productId: string }) {
    return (
        <div className="space-y-6">
            <AttributeEditor productId={productId} />
            <VariantManager productId={productId} />
        </div>
    );
}
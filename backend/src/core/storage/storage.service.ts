import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const MIME_EXT: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
};

@Injectable()
export class StorageService {
    private readonly client: S3Client;
    private readonly bucket: string;
    private readonly publicUrl: string;

    constructor(config: ConfigService) {
        const accountId = config.getOrThrow<string>('R2_ACCOUNT_ID');
        this.bucket = config.getOrThrow<string>('R2_BUCKET');
        this.publicUrl = config.getOrThrow<string>('R2_PUBLIC_URL').replace(/\/+$/, '');

        this.client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: config.getOrThrow<string>('R2_ACCESS_KEY_ID'),
                secretAccessKey: config.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
            },
        });
    }

    async uploadImage(file: Express.Multer.File, folder = 'misc'): Promise<{ url: string; key: string }> {
        const ext = MIME_EXT[file.mimetype] ?? 'bin';
        const key = `${folder}/${randomUUID()}.${ext}`;

        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                CacheControl: 'public, max-age=31536000, immutable',
            }),
        );

        return { url: `${this.publicUrl}/${key}`, key };
    }
    keyFromUrl(url: string): string | null {
        if (!url.startsWith(this.publicUrl + '/')) return null;
        return url.slice(this.publicUrl.length + 1);
    }

    async deleteByKey(key: string): Promise<void> {
        await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    }
    async safeDeleteByUrl(url?: string | null): Promise<void> {
        if (!url) return;
        const key = this.keyFromUrl(url);
        if (!key) return;
        try {
            await this.deleteByKey(key);
        } catch {
        }
    }
}
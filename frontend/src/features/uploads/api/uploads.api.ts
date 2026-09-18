import { apiClient } from "@/shared/lib/api-client";


export type UploadFolder = 'brands' | 'products' | 'categories' | 'avatars' | 'misc';

export interface UploadedFile {
    url: string;
    key: string;
}
export async function uploadImages(files: File[], folder: UploadFolder): Promise<UploadedFile[]> {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const { data } = await apiClient.post<UploadedFile[]>('/uploads/images', form, {
        params: { folder },
    });
    return data;
}
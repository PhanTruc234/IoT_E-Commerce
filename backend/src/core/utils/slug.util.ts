import slugify from 'slugify';

export function createSlug(input: string): string {
    const normalized = input
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd');

    return slugify(normalized, {
        lower: true,
        strict: true,
        trim: true,
    });
}
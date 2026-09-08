export function skuToken(input: string): string {
    return input
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'D')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function buildSku(parts: Array<string | null | undefined>): string {
    return parts
        .map((p) => (p ? skuToken(p) : ''))
        .filter(Boolean)
        .join('-');
}
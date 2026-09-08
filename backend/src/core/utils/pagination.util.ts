export function buildMeta(total: number, page: number, limit: number) {
    return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
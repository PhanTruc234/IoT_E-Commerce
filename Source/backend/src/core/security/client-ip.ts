type RequestLike = { headers?: Record<string, string | string[] | undefined>; ip?: string };
export function resolveClientIp(req: RequestLike, ipHeader?: string): string {
    const name = ipHeader?.trim().toLowerCase();
    const fromHeader = name ? req.headers?.[name] : undefined;
    if (typeof fromHeader === 'string' && fromHeader) return fromHeader.split(',')[0].trim();
    return req.ip ?? 'unknown';
}
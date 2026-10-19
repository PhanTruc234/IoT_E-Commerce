import type { NextFunction, Request, Response } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const EXEMPT_PREFIXES = ['/api/payments/', '/api/shipping/ghn/'];
export function csrfProtection(allowedOrigins: string[]) {
    const allowed = new Set(allowedOrigins);

    return (req: Request, res: Response, next: NextFunction) => {
        if (SAFE_METHODS.has(req.method) || EXEMPT_PREFIXES.some((p) => req.path.startsWith(p))) {
            return next();
        }

        const origin = req.get('origin');
        const sameOrigin = !!origin && origin === `${req.protocol}://${req.get('host')}`;

        if (origin && !sameOrigin && !allowed.has(origin)) {
            return reject(res, 'Nguồn gửi yêu cầu không hợp lệ');
        }
        if (!sameOrigin && req.get('x-requested-with') !== 'XMLHttpRequest') {
            return reject(res, 'Yêu cầu thiếu header bảo mật');
        }
        next();
    };
}

function reject(res: Response, message: string) {
    res.status(403).json({ statusCode: 403, message, error: 'Forbidden' });
}
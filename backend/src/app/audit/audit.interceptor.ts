import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

const SKIP_PREFIX = ['/events', '/auth', '/cart', '/admin/audit-logs', '/uploads'];
const MUTATING = ['POST', 'PATCH', 'PUT', 'DELETE'];
const SENSITIVE = ['password', 'passwordHash', 'token', 'refreshToken', 'accessToken'];

function resolveEntity(segs: string[]): string {
    if (segs.includes('reviews')) {
        return 'REVIEW';
    }
    if (segs.includes('questions')) {
        return 'QUESTION';
    }
    if (segs.includes('variants')) {
        return 'VARIANT';
    }
    if (segs.includes('combo-items')) {
        return 'COMBO';
    }
    if (segs.includes('images')) {
        return 'PRODUCT_IMAGE';
    }
    if (segs.includes('attributes')) {
        return 'ATTRIBUTE';
    }
    if (segs.includes('products')) {
        return 'PRODUCT';
    }
    if (segs.includes('categories')) {
        return 'CATEGORY';
    }
    if (segs.includes('brands')) {
        return 'BRAND';
    }
    if (segs.includes('orders')) {
        return 'ORDER';
    }
    if (segs.includes('serials')) {
        return 'SERIAL';
    }
    if (segs.includes('specifications')) {
        return 'SPECIFICATION';
    }
    return 'OTHER';
}

function resolveAction(method: string, entity: string, last: string, body: Record<string, unknown> | undefined): string {
    if (method === 'DELETE') {
        return 'DELETE';
    }
    if (method === 'POST') {
        if (entity === 'ORDER' && last === 'orders') {
            return 'PLACE_ORDER';
        }
        if (last === 'generate') {
            return 'GENERATE';
        }
        return 'CREATE';
    }
    if (last === 'status') {
        if (entity === 'REVIEW' && body?.status === 'APPROVED') {
            return 'APPROVE';
        }
        if (entity === 'REVIEW' && body?.status === 'REJECTED') {
            return 'REJECT';
        }
        return 'STATUS_CHANGE';
    }
    if (last === 'cancel') {
        return 'CANCEL_ORDER';
    }
    if (last === 'activate') {
        return 'ACTIVATE';
    }
    if (last === 'answer') {
        return 'ANSWER';
    }
    return 'UPDATE';
}

function classify(method: string, path: string, params: Record<string, string>, body: Record<string, unknown> | undefined) {
    const segs = path.split('/').filter(Boolean).filter((s) => s !== 'api' && s !== 'admin');
    const entity = resolveEntity(segs);
    const last = segs[segs.length - 1];
    const action = resolveAction(method, entity, last, body);
    const entityId = params?.id ?? params?.variantId ?? params?.imageId ?? params?.comboId ?? params?.productId ?? null;
    return { entity, entityId, action, summary: `${action} ${entity}` };
}

function safeBody(body: unknown): Record<string, unknown> | undefined {
    if (!body || typeof body !== 'object') {
        return undefined;
    }
    const clone: Record<string, unknown> = { ...(body as Record<string, unknown>) };
    for (const key of SENSITIVE) {
        delete clone[key];
    }
    return Object.keys(clone).length ? clone : undefined;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly audit: AuditService) { }

    intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
        const req = ctx.switchToHttp().getRequest();
        const method: string = req.method;

        if (!MUTATING.includes(method)) {
            return next.handle();
        }

        const path = ((req.originalUrl || req.url || '').split('?')[0] as string).replace(/^\/api/, '') || '/';
        if (SKIP_PREFIX.some((prefix) => path.startsWith(prefix))) {
            return next.handle();
        }

        const user = req.user;
        if (!user) {
            return next.handle();
        }

        const meta = classify(method, path, req.params ?? {}, req.body);
        const base = {
            actorId: user.id,
            actorEmail: user.email,
            role: user.role,
            method,
            path,
            entity: meta.entity,
            action: meta.action,
            ipAddress: req.ip,
            userAgent: req.headers?.['user-agent'],
            metadata: safeBody(req.body),
        };
        const res = ctx.switchToHttp().getResponse();

        return next.handle().pipe(
            tap((data: unknown) => {
                const d = data as { id?: string; code?: string } | null;
                const createdId =
                    (meta.action === 'CREATE' || meta.action === 'PLACE_ORDER') && d?.id
                        ? d.id
                        : meta.entityId ?? d?.id ?? null;
                const summary = meta.summary + (d?.code ? ` (${d.code})` : '');
                void this.audit.record({ ...base, entityId: createdId, summary, statusCode: res.statusCode ?? 200 });
            }),
            catchError((err) => {
                void this.audit.record({
                    ...base,
                    entityId: meta.entityId,
                    summary: meta.summary,
                    statusCode: err?.status ?? 500,
                });
                return throwError(() => err);
            }),
        );
    }
}

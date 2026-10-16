import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport'
import { IS_PUBLIC_KEY } from '../../../core/decorators/public.decorator';
import { IS_OPTIONAL_AUTH_KEY } from '../../../core/decorators/optional-auth.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        const targets = [context.getHandler(), context.getClass()];
        if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
            return true;
        }
        if (this.reflector.getAllAndOverride<boolean>(IS_OPTIONAL_AUTH_KEY, targets)) {
            // Có token hợp lệ thì gắn req.user, không có (khách) thì vẫn cho qua
            try {
                await super.canActivate(context);
            } catch {
                // khách chưa đăng nhập
            }
            return true;
        }
        return (await super.canActivate(context)) as boolean;
    }
}
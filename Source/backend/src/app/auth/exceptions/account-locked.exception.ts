import { HttpException, HttpStatus } from '@nestjs/common';
export class AccountLockedException extends HttpException {
    constructor(
        readonly lockedUntil: Date,
        readonly justLocked = false,
    ) {
        const retryAfter = Math.max(1, Math.ceil((lockedUntil.getTime() - Date.now()) / 1000));
        const minutes = Math.ceil(retryAfter / 60);
        super(
            {
                statusCode: HttpStatus.LOCKED,
                message: justLocked
                    ? `Bạn đã đăng nhập sai quá nhiều lần, tạm khoá ${minutes} phút.`
                    : `Tài khoản đang tạm khoá do đăng nhập sai nhiều lần. Vui lòng thử lại sau ${minutes} phút.`,
                retryAfter,
            },
            HttpStatus.TOO_MANY_REQUESTS,
        );
    }
}
import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';

// Câu báo riêng cho đăng nhập / đăng ký; các thao tác khác dùng câu chung
const ACTION_MESSAGES: Record<string, string> = {
    'AuthController.login': 'Bạn đã đăng nhập sai quá nhiều lần',
    'AuthController.register': 'Bạn đã đăng ký sai quá nhiều lần',
};

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
    protected throwThrottlingException(context: ExecutionContext, detail: ThrottlerLimitDetail): Promise<void> {
        const retryAfter = Math.max(1, detail.timeToBlockExpire);
        const wait = retryAfter >= 60 ? `${Math.ceil(retryAfter / 60)} phút` : `${retryAfter} giây`;
        const action =
            ACTION_MESSAGES[`${context.getClass().name}.${context.getHandler().name}`] ?? 'Bạn thao tác quá nhiều lần';
        return Promise.reject(
            new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    message: `${action}, tạm khoá ${wait}.`,
                    retryAfter,
                },
                HttpStatus.TOO_MANY_REQUESTS,
            ),
        );
    }
}

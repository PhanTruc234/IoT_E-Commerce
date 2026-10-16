import { SetMetadata } from '@nestjs/common';

// Đăng nhập tuỳ chọn: khách chưa đăng nhập vẫn gọi được; đã đăng nhập thì vẫn có req.user
export const IS_OPTIONAL_AUTH_KEY = 'isOptionalAuth';
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_AUTH_KEY, true);

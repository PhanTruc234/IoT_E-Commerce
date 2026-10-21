import { ArgumentsHost, Catch, ConflictException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

// Lời nhắn theo bảng (meta.modelName) khi vi phạm ràng buộc unique
const DUPLICATE_MESSAGE: Record<string, string> = {
    Review: 'Bạn đã đánh giá sản phẩm này',
    Category: 'Danh mục với đường dẫn này đã tồn tại',
    Brand: 'Thương hiệu với đường dẫn này đã tồn tại',
    Product: 'SKU hoặc đường dẫn sản phẩm đã tồn tại',
    ProductVariant: 'SKU phân loại đã tồn tại',
    Coupon: 'Mã giảm giá đã tồn tại',
    Serial: 'Số serial đã tồn tại',
    Specification: 'Thông số này đã tồn tại',
};

function messageFor(e: Prisma.PrismaClientKnownRequestError): string {
    const model = String(e.meta?.modelName ?? '');
    const target = ([] as string[]).concat((e.meta?.target as string | string[] | undefined) ?? []).join(',');
    if (model === 'User') {
        return target.includes('googleId')
            ? 'Tài khoản Google này vừa được liên kết, vui lòng đăng nhập lại'
            : 'Email đã được sử dụng';
    }
    return DUPLICATE_MESSAGE[model] ?? 'Dữ liệu vừa được tạo bởi thao tác khác, vui lòng tải lại trang và thử lại';
}

/**
 * Lỗi Prisma lọt tới controller trả 500 "Internal server error". Hai lỗi do request trùng / chạy song song
 * thì đổi thành 409 kèm lời nhắn dễ hiểu; còn lại giữ nguyên xử lý mặc định của Nest.
 * P2002: vi phạm unique (bấm 2 lần, 2 tab cùng tạo). P2034: transaction xung đột / deadlock, thử lại là được.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
    catch(e: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        if (e.code === 'P2002') return super.catch(new ConflictException(messageFor(e)), host);
        if (e.code === 'P2034') return super.catch(new ConflictException('Hệ thống đang bận xử lý thao tác khác trên dữ liệu này, vui lòng thử lại'), host);
        return super.catch(e, host);
    }
}

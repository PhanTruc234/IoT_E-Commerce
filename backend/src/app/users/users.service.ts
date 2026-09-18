import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildMeta } from '../../core/utils/pagination.util';
import { UserListQueryDto } from './dto/user-list-query.dto';

const ADMIN_SELECT = {
    id: true,
    email: true,
    fullName: true,
    phone: true,
    role: true,
    isActive: true,
    isEmailVerified: true,
    createdAt: true,
    _count: { select: { orders: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }
    searchCustomers(search?: string) {
        const q = (search ?? '').trim();
        return this.prisma.user.findMany({
            where: {
                role: 'CUSTOMER',
                ...(q
                    ? {
                        OR: [
                            { fullName: { contains: q, mode: 'insensitive' } },
                            { email: { contains: q, mode: 'insensitive' } },
                            { phone: { contains: q } },
                        ],
                    }
                    : {}),
            },
            orderBy: { fullName: 'asc' },
            take: 20,
            select: { id: true, fullName: true, email: true, phone: true },
        });
    }
    findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async getProfileOrThrow(id: string): Promise<User> {
        const user = await this.findById(id);
        if (!user) throw new NotFoundException('Không tìm thấy người dùng');
        return user;
    }

    async updateProfile(id: string, data: { fullName?: string; phone?: string; address?: string }): Promise<User> {
        await this.getProfileOrThrow(id);
        return this.prisma.user.update({ where: { id }, data });
    }

    async findAllAdmin(query: UserListQueryDto) {
        const { page, limit, search, role, isActive } = query;
        const where: Prisma.UserWhereInput = {
            ...(role ? { role } : {}),
            ...(isActive === 'true' ? { isActive: true } : {}),
            ...(isActive === 'false' ? { isActive: false } : {}),
            ...(search
                ? {
                    OR: [
                        { fullName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { phone: { contains: search } },
                    ],
                }
                : {}),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                select: ADMIN_SELECT,
            }),
            this.prisma.user.count({ where }),
        ]);

        return { data, meta: buildMeta(total, page, limit) };
    }

    async setRole(actorId: string, id: string, role: Role) {
        if (id === actorId) {
            throw new BadRequestException('Không thể tự đổi vai trò của chính mình');
        }
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }
        if (user.role === 'ADMIN' && role === 'CUSTOMER') {
            const admins = await this.prisma.user.count({ where: { role: 'ADMIN' } });
            if (admins <= 1) {
                throw new BadRequestException('Phải còn ít nhất 1 quản trị viên');
            }
        }
        return this.prisma.user.update({ where: { id }, data: { role }, select: ADMIN_SELECT });
    }

    async setActive(actorId: string, id: string, isActive: boolean) {
        if (id === actorId) {
            throw new BadRequestException('Không thể tự khoá tài khoản của chính mình');
        }
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }
        if (user.role === 'ADMIN' && !isActive) {
            const activeAdmins = await this.prisma.user.count({ where: { role: 'ADMIN', isActive: true } });
            if (activeAdmins <= 1) {
                throw new BadRequestException('Phải còn ít nhất 1 quản trị viên đang hoạt động');
            }
        }
        return this.prisma.user.update({ where: { id }, data: { isActive }, select: ADMIN_SELECT });
    }

}
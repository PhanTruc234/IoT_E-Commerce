import {
    ConflictException,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AccessTokenPayload {
    sub: string;
    email: string;
    role: string;
}

export interface RefreshTokenPayload {
    sub: string;
    jti: string;
}

export interface SessionMeta {
    userAgent?: string;
    ipAddress?: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
    ) { }
    sanitize(user: User) {
        const { passwordHash, ...safe } = user;
        return safe;
    }
    private async issueTokens(user: User, meta: SessionMeta) {
        const jti = randomUUID();

        const accessToken = await this.jwtService.signAsync(
            { sub: user.id, email: user.email, role: user.role } as AccessTokenPayload,
            {
                secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
                expiresIn:
                    (this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m') as any,
            },
        );

        const refreshToken = await this.jwtService.signAsync(
            { sub: user.id, jti } as RefreshTokenPayload,
            {
                secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
                expiresIn:
                    (this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d') as any,
            },
        );

        const decoded = this.jwtService.decode(refreshToken) as { exp: number };
        const tokenHash = await bcrypt.hash(refreshToken, 10);

        await this.prisma.refreshToken.create({
            data: {
                id: jti,
                userId: user.id,
                tokenHash,
                expiresAt: new Date(decoded.exp * 1000),
                userAgent: meta.userAgent,
                ipAddress: meta.ipAddress,
            },
        });

        return { user: this.sanitize(user), accessToken, refreshToken };
    }
    async register(dto: RegisterDto, meta: SessionMeta) {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('Email đã được sử dụng');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.create({
            email: dto.email,
            passwordHash,
            fullName: dto.fullName,
            phone: dto.phone,
        });
        return this.issueTokens(user, meta);
    }

    async login(dto: LoginDto, meta: SessionMeta) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }
        if (!user.isActive) {
            throw new ForbiddenException('Tài khoản đã bị khóa');
        }

        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }

        return this.issueTokens(user, meta);
    }

    async refresh(userId: string, jti: string, presentedToken: string, meta: SessionMeta,) {
        const record = await this.prisma.refreshToken.findUnique({
            where: { id: jti },
        });

        const invalid =
            !record ||
            record.userId !== userId ||
            record.revokedAt !== null ||
            record.expiresAt < new Date();
        if (invalid) {
            throw new ForbiddenException('Phiên đăng nhập không hợp lệ');
        }

        const matches = await bcrypt.compare(presentedToken, record!.tokenHash);
        if (!matches) {
            await this.prisma.refreshToken.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
            throw new ForbiddenException('Phát hiện token bị tái sử dụng');
        }

        await this.prisma.refreshToken.update({
            where: { id: jti },
            data: { revokedAt: new Date() },
        });

        const user = await this.usersService.getProfileOrThrow(userId);
        return this.issueTokens(user, meta);
    }

    async logout(userId: string) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { message: 'Đăng xuất thành công' };
    }
}
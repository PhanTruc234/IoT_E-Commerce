import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
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
import { GoogleLoginDto } from './dto/google-login.dto';
import { OAuth2Client } from 'google-auth-library';
import { POLICY_VERSION } from 'src/core/config/policy';

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
    private async pruneExpiredTokens(userId: string) {
        await this.prisma.refreshToken.deleteMany({
            where: { userId, expiresAt: { lt: new Date() } },
        });
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

        await this.pruneExpiredTokens(user.id);

        return { user: this.sanitize(user), accessToken, refreshToken };
    }

    private async recordSignupConsent(userId: string, meta: SessionMeta) {
        const now = new Date();
        await this.prisma.userConsent.createMany({
            data: [
                {
                    userId,
                    type: 'TERMS',
                    version: POLICY_VERSION.TERMS,
                    granted: true,
                    grantedAt: now,
                    ipAddress: meta.ipAddress,
                    userAgent: meta.userAgent
                },
                {
                    userId, type: 'PRIVACY',
                    version: POLICY_VERSION.PRIVACY,
                    granted: true, grantedAt: now,
                    ipAddress: meta.ipAddress,
                    userAgent: meta.userAgent
                },
            ],
        });
    }

    async register(dto: RegisterDto, meta: SessionMeta) {
        if (!dto.acceptTerms) {
            throw new BadRequestException('Bạn cần đồng ý Điều khoản & Chính sách bảo vệ dữ liệu để đăng ký');
        }
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
        await this.recordSignupConsent(user.id, meta);
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
        if (!user.passwordHash) {
            throw new UnauthorizedException('Tài khoản này đăng nhập bằng Google');
        }
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }

        return this.issueTokens(user, meta);
    }
    async googleLogin(dto: GoogleLoginDto, meta: SessionMeta) {
        const clientId = this.config.getOrThrow<string>('GOOGLE_CLIENT_ID');
        const client = new OAuth2Client(clientId);

        let payload;
        try {
            const ticket = await client.verifyIdToken({ idToken: dto.idToken, audience: clientId });
            payload = ticket.getPayload();
        } catch {
            throw new UnauthorizedException('Token Google không hợp lệ');
        }
        if (!payload?.email) {
            throw new UnauthorizedException('Không lấy được email từ Google');
        }

        const googleId = payload.sub;
        let user = await this.prisma.user.findUnique({ where: { googleId } });

        if (!user) {
            const existing = await this.usersService.findByEmail(payload.email);
            if (existing) {
                user = await this.prisma.user.update({
                    where: { id: existing.id },
                    data: {
                        googleId,
                        avatarUrl: existing.avatarUrl ?? payload.picture ?? null,
                        isEmailVerified: true,
                    },
                });
            } else {
                user = await this.prisma.user.create({
                    data: {
                        email: payload.email,
                        fullName: payload.name ?? payload.email.split('@')[0],
                        googleId,
                        avatarUrl: payload.picture ?? null,
                        isEmailVerified: true,
                    },
                });
                await this.recordSignupConsent(user.id, meta);
            }
        }

        if (!user.isActive) {
            throw new ForbiddenException('Tài khoản đã bị khóa');
        }
        return this.issueTokens(user, meta);
    }
    async refresh(userId: string, jti: string, presentedToken: string, meta: SessionMeta,) {
        const record = await this.prisma.refreshToken.findUnique({
            where: { id: jti },
        });
        if (!record || record.userId !== userId || record.expiresAt < new Date()) {
            throw new ForbiddenException('Phiên đăng nhập không hợp lệ');
        }
        const matches = await bcrypt.compare(presentedToken, record.tokenHash);
        if (!matches) {
            throw new ForbiddenException('Phiên đăng nhập không hợp lệ');
        }
        if (record.revokedAt) {
            await this.prisma.refreshToken.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
            throw new ForbiddenException('Phát hiện refresh token bị dùng lại — đã thu hồi mọi phiên');
        }
        await this.prisma.refreshToken.update({
            where: { id: jti },
            data: { revokedAt: new Date() },
        });

        const user = await this.usersService.getProfileOrThrow(userId);
        return this.issueTokens(user, meta);
    }
    async listSessions(userId: string, refreshToken?: string) {
        let currentJti: string | null = null;
        if (refreshToken) {
            const decoded = this.jwtService.decode(refreshToken) as { jti?: string } | null;
            currentJti = decoded?.jti ?? null;
        }
        const rows = await this.prisma.refreshToken.findMany({
            where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
            select: { id: true, userAgent: true, ipAddress: true, createdAt: true, expiresAt: true },
        });

        const seen = new Map<string, { id: string; userAgent: string | null; ipAddress: string | null; createdAt: Date; expiresAt: Date; current: boolean }>();
        for (const r of rows) {
            const key = `${r.userAgent ?? ''}|${r.ipAddress ?? ''}`;
            const existing = seen.get(key);
            if (!existing) {
                seen.set(key, { ...r, current: r.id === currentJti });
            } else if (r.id === currentJti) {
                existing.current = true;
            }
        }
        return [...seen.values()];
    }

    async revokeSession(userId: string, id: string) {
        const token = await this.prisma.refreshToken.findFirst({ where: { id, userId } });
        if (!token) {
            throw new NotFoundException('Không tìm thấy phiên đăng nhập');
        }
        await this.prisma.refreshToken.updateMany({
            where: { userId, userAgent: token.userAgent, ipAddress: token.ipAddress, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { message: 'Đã thu hồi phiên đăng nhập' };
    }
    async logout(userId: string) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { message: 'Đăng xuất thành công' };
    }
}
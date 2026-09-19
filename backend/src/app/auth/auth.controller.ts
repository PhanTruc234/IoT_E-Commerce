import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    Ip,
    Param,
    Patch,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CookieOptions, Request, Response } from 'express';
import { AuthUser, CurrentUser } from '../../core/decorators/current-user.decorator';
import { Public } from '../../core/decorators/public.decorator';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RegisterDto } from './dto/register.dto';
import { AuditService } from '../audit/audit.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/auth';
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const ACCESS_COOKIE = 'accessToken';
const ACCESS_MAX_AGE = 15 * 60 * 1000;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly config: ConfigService,
        private readonly audit: AuditService,
    ) { }

    private cookieOptions(maxAge: number, path: string): CookieOptions {
        const sameSite = (this.config.get<string>('COOKIE_SAMESITE') ?? 'lax').toLowerCase() as 'lax' | 'strict' | 'none';
        const secureEnv = this.config.get<string>('COOKIE_SECURE');
        const secure =
            secureEnv !== undefined
                ? secureEnv === 'true'
                : this.config.get<string>('NODE_ENV') === 'production';
        return {
            httpOnly: true,
            secure: secure || sameSite === 'none',
            sameSite,
            domain: this.config.get<string>('COOKIE_DOMAIN') || undefined,
            path,
            maxAge,
        };
    }

    private clearCookieOptions(path: string): CookieOptions {
        return {
            path,
            domain: this.config.get<string>('COOKIE_DOMAIN') || undefined,
        };
    }

    private setRefreshCookie(res: Response, token: string) {
        res.cookie(REFRESH_COOKIE, token, this.cookieOptions(REFRESH_MAX_AGE, REFRESH_COOKIE_PATH));
    }

    private setAccessCookie(res: Response, token: string) {
        res.cookie(ACCESS_COOKIE, token, this.cookieOptions(ACCESS_MAX_AGE, '/'));
    }

    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @UseGuards(ThrottlerGuard)
    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Đăng ký tài khoản khách hàng' })
    async register(
        @Body() dto: RegisterDto,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { accessToken, refreshToken, ...rest } = await this.authService.register(dto, {
            ipAddress: ip,
            userAgent,
        });
        this.setRefreshCookie(res, refreshToken);
        this.setAccessCookie(res, accessToken);
        void this.audit.record({
            actorId: rest.user.id,
            actorEmail: rest.user.email,
            role: rest.user.role,
            action: 'REGISTER',
            entity: 'AUTH',
            method: 'POST',
            path: '/auth/register',
            statusCode: 201,
            ipAddress: ip,
            userAgent,
            summary: 'Đăng ký tài khoản',
        });
        return rest;
    }

    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @UseGuards(ThrottlerGuard)
    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Đăng nhập' })
    async login(
        @Body() dto: LoginDto,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        try {
            const { accessToken, refreshToken, ...rest } = await this.authService.login(dto, {
                ipAddress: ip,
                userAgent,
            });
            this.setRefreshCookie(res, refreshToken);
            this.setAccessCookie(res, accessToken);
            void this.audit.record({
                actorId: rest.user.id,
                actorEmail: rest.user.email,
                role: rest.user.role,
                action: 'LOGIN',
                entity: 'AUTH',
                method: 'POST',
                path: '/auth/login',
                statusCode: 200,
                ipAddress: ip,
                userAgent,
                summary: 'Đăng nhập',
            });
            return rest;
        } catch (e) {
            void this.audit.record({
                actorEmail: dto.email,
                role: null,
                action: 'LOGIN_FAILED',
                entity: 'AUTH',
                method: 'POST',
                path: '/auth/login',
                statusCode: (e as { status?: number })?.status ?? 401,
                ipAddress: ip,
                userAgent,
                summary: 'Đăng nhập thất bại',
            });
            throw e;
        }
    }

    @Throttle({ default: { limit: 10, ttl: 60_000 } })
    @UseGuards(ThrottlerGuard)
    @Public()
    @Post('google')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Đăng nhập bằng Google' })
    async google(
        @Body() dto: GoogleLoginDto,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { accessToken, refreshToken, ...rest } = await this.authService.googleLogin(dto, { ipAddress: ip, userAgent });
        this.setRefreshCookie(res, refreshToken);
        this.setAccessCookie(res, accessToken);
        void this.audit.record({
            actorId: rest.user.id,
            actorEmail: rest.user.email,
            role: rest.user.role,
            action: 'LOGIN',
            entity: 'AUTH',
            method: 'POST',
            path: '/auth/google',
            statusCode: 200,
            ipAddress: ip,
            userAgent,
            summary: 'Đăng nhập bằng Google',
        });
        return rest;
    }

    @Public()
    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Làm mới access token (đọc refresh token từ cookie)' })
    async refresh(
        @CurrentUser() user: AuthUser,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { accessToken, refreshToken, ...rest } = await this.authService.refresh(
            user.id,
            user.jti!,
            user.refreshToken!,
            { ipAddress: ip, userAgent },
        );
        this.setRefreshCookie(res, refreshToken);
        this.setAccessCookie(res, accessToken);
        return rest;
    }

    @ApiBearerAuth()
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Đăng xuất (thu hồi mọi phiên + xóa cookie)' })
    async logout(
        @CurrentUser() user: AuthUser,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.logout(user.id);
        res.clearCookie(REFRESH_COOKIE, this.clearCookieOptions(REFRESH_COOKIE_PATH));
        res.clearCookie(ACCESS_COOKIE, this.clearCookieOptions('/'));
        void this.audit.record({
            actorId: user.id,
            actorEmail: user.email,
            role: user.role,
            action: 'LOGOUT',
            entity: 'AUTH',
            method: 'POST',
            path: '/auth/logout',
            statusCode: 200,
            ipAddress: ip,
            userAgent,
            summary: 'Đăng xuất',
        });
        return result;
    }

    @ApiBearerAuth()
    @Get('sessions')
    @ApiOperation({ summary: 'Danh sách thiết bị/phiên đăng nhập' })
    sessions(@CurrentUser('id') userId: string, @Req() req: Request) {
        const refreshToken = (req.cookies as { refreshToken?: string })?.refreshToken;
        return this.authService.listSessions(userId, refreshToken);
    }

    @ApiBearerAuth()
    @Delete('sessions/:id')
    @ApiOperation({ summary: 'Thu hồi 1 phiên đăng nhập' })
    async revokeSession(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
    ) {
        const result = await this.authService.revokeSession(userId, id);
        void this.audit.record({
            actorId: userId,
            action: 'SESSION_REVOKED',
            entity: 'AUTH',
            entityId: id,
            method: 'DELETE',
            path: '/auth/sessions',
            statusCode: 200,
            ipAddress: ip,
            userAgent,
            summary: 'Thu hồi phiên đăng nhập',
        });
        return result;
    }

    @ApiBearerAuth()
    @Get('me')
    @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
    async me(@CurrentUser('id') userId: string) {
        const user = await this.usersService.getProfileOrThrow(userId);
        return this.authService.sanitize(user);
    }

    @ApiBearerAuth()
    @Patch('me')
    @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
    async updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
        const user = await this.usersService.updateProfile(userId, dto);
        return this.authService.sanitize(user);
    }
}
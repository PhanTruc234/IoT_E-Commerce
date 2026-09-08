import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    Ip,
    Post,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthUser, CurrentUser } from '../../core/decorators/current-user.decorator';
import { Public } from '../../core/decorators/public.decorator';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RegisterDto } from './dto/register.dto';

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
    ) { }

    private setRefreshCookie(res: Response, token: string) {
        res.cookie(REFRESH_COOKIE, token, {
            httpOnly: true,
            secure: this.config.get<string>('NODE_ENV') === 'production',
            sameSite: 'lax',
            path: REFRESH_COOKIE_PATH,
            maxAge: REFRESH_MAX_AGE,
        });
    }

    private setAccessCookie(res: Response, token: string) {
        res.cookie(ACCESS_COOKIE, token, {
            httpOnly: true,
            secure: this.config.get<string>('NODE_ENV') === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: ACCESS_MAX_AGE,
        });
    }

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
        return rest;
    }

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
        const { accessToken, refreshToken, ...rest } = await this.authService.login(dto, {
            ipAddress: ip,
            userAgent,
        });
        this.setRefreshCookie(res, refreshToken);
        this.setAccessCookie(res, accessToken);
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
        @CurrentUser('id') userId: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.logout(userId);
        res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
        res.clearCookie(ACCESS_COOKIE, { path: '/' });
        return result;
    }

    @ApiBearerAuth()
    @Get('me')
    @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
    async me(@CurrentUser('id') userId: string) {
        const user = await this.usersService.getProfileOrThrow(userId);
        return this.authService.sanitize(user);
    }
}
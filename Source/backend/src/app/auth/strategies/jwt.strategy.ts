import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { AccessTokenPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        config: ConfigService,
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) =>
                    (req?.cookies as { accessToken?: string })?.accessToken ?? null,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        });
    }

    async validate(payload: AccessTokenPayload) {
        const user = await this.usersService.findById(payload.sub);
        if (!user || !user.isActive) {
            throw new UnauthorizedException();
        }
        return { id: user.id, email: user.email, role: user.role };
    }
}
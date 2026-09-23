import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshTokenPayload } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh',) {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) =>
                    (req?.cookies as { refreshToken?: string })?.refreshToken ?? null,
            ]),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: RefreshTokenPayload) {
        const refreshToken = (req.cookies as { refreshToken?: string })
            ?.refreshToken;
        return { id: payload.sub, jti: payload.jti, refreshToken };
    }
}
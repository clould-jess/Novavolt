import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserStatus } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../common/types/auth-user';
import { PrismaService } from '../prisma.service';

interface AccessPayload {
  sub: string;
  sid: string;
  type: 'access';
  iat: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly db: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      issuer: config.get<string>('JWT_ISSUER', 'novavolt-api'),
      audience: config.get<string>('JWT_AUDIENCE', 'novavolt-clients'),
    });
  }

  async validate(payload: AccessPayload): Promise<AuthUser> {
    if (payload.type !== 'access' || !payload.sub || !payload.sid) {
      throw new UnauthorizedException();
    }

    const session = await this.db.session.findUnique({
      where: { id: payload.sid },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            passwordChangedAt: true,
          },
        },
      },
    });
    if (
      !session ||
      session.userId !== payload.sub ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.user.status !== UserStatus.ACTIVE ||
      session.user.passwordChangedAt.getTime() > payload.iat * 1000 + 1000
    ) {
      throw new UnauthorizedException();
    }

    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      status: session.user.status,
      sessionId: session.id,
    };
  }
}

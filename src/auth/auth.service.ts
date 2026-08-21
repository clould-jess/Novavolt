import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, TokenType, User, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { RequestContext } from '../common/types/auth-user';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma.service';
import {
  ChangePasswordDto,
  LoginDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto';
import {
  assertPasswordIsNotCommon,
  createOpaqueToken,
  hashOpaqueToken,
  normalizeEmail,
} from './auth.utils';

type SafeUser = Pick<User, 'id' | 'email' | 'role' | 'status'>;

interface RefreshPayload {
  sub: string;
  sid: string;
  ver: number;
  type: 'refresh';
}

@Injectable()
export class AuthService {
  private readonly dummyHash = argon2.hash(randomBytes(32), this.argonOptions());

  constructor(
    private readonly db: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
  ) {}

  async register(dto: RegisterDto, context: RequestContext = {}) {
    const email = normalizeEmail(dto.email);
    try {
      assertPasswordIsNotCommon(dto.password);
    } catch {
      throw new BadRequestException('Password is too common');
    }

    const passwordHash = await argon2.hash(dto.password, this.argonOptions());
    const requireVerification = this.config.get<boolean>(
      'REQUIRE_EMAIL_VERIFICATION',
      false,
    );
    const token = createOpaqueToken();
    const expiresAt = new Date(Date.now() + 30 * 60_000);

    let user: SafeUser;
    try {
      user = await this.db.$transaction(async (transaction) => {
        const created = await transaction.user.create({
          data: {
            email,
            passwordHash,
            status: requireVerification
              ? UserStatus.PENDING
              : UserStatus.ACTIVE,
            emailVerifiedAt: requireVerification ? null : new Date(),
            profile: {
              create: {
                firstName: dto.firstName,
                lastName: dto.lastName,
              },
            },
          },
          select: { id: true, email: true, role: true, status: true },
        });

        if (requireVerification) {
          await transaction.oneTimeToken.create({
            data: {
              userId: created.id,
              type: TokenType.EMAIL_VERIFICATION,
              tokenHash: hashOpaqueToken(token),
              expiresAt,
            },
          });
        }
        return created;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Account already exists');
      }
      throw error;
    }

    if (requireVerification) {
      await this.queueVerification(user, token);
      return {
        user,
        verificationRequired: true,
        ...this.developmentToken('verificationToken', token),
      };
    }

    return this.createAuthenticatedSession(user, context);
  }

  async login(dto: LoginDto, context: RequestContext = {}) {
    const email = normalizeEmail(dto.email);
    const user = await this.db.user.findUnique({ where: { email } });
    const hash = user?.passwordHash ?? (await this.dummyHash);
    const validPassword = await argon2.verify(hash, dto.password).catch(() => false);
    const now = new Date();

    if (!user || !validPassword) {
      if (user) {
        await this.recordFailedLogin(user.id, user.failedLoginAttempts);
      }
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.lockedUntil && user.lockedUntil > now) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: now,
      },
    });

    return this.createAuthenticatedSession(user, context);
  }

  async refresh(dto: RefreshDto, context: RequestContext = {}) {
    let payload: RefreshPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(dto.refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        issuer: this.config.get<string>('JWT_ISSUER', 'novavolt-api'),
        audience: this.config.get<string>('JWT_AUDIENCE', 'novavolt-clients'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (
      payload.type !== 'refresh' ||
      !payload.sub ||
      !payload.sid ||
      !Number.isSafeInteger(payload.ver)
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.db.session.findUnique({
      where: { id: payload.sid },
      include: { user: true },
    });
    if (
      !session ||
      session.userId !== payload.sub ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.user.status !== UserStatus.ACTIVE
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.tokenVersion !== payload.ver) {
      await this.db.session.updateMany({
        where: { id: session.id, revokedAt: null },
        data: { revokedAt: new Date(), revokedReason: 'refresh_token_reuse' },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await argon2
      .verify(session.refreshTokenHash, dto.refreshToken)
      .catch(() => false);
    if (!matches) {
      await this.db.session.updateMany({
        where: { id: session.id, revokedAt: null },
        data: { revokedAt: new Date(), revokedReason: 'refresh_token_mismatch' },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    const nextVersion = session.tokenVersion + 1;
    const tokens = await this.issueTokens(session.user, session.id, nextVersion);
    const updated = await this.db.session.updateMany({
      where: {
        id: session.id,
        tokenVersion: session.tokenVersion,
        revokedAt: null,
      },
      data: {
        tokenVersion: nextVersion,
        refreshTokenHash: await argon2.hash(
          tokens.refreshToken,
          this.argonOptions(),
        ),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        lastUsedAt: new Date(),
      },
    });
    if (updated.count !== 1) {
      throw new UnauthorizedException('Refresh token was already used');
    }
    return tokens;
  }

  async logout(userId: string, sessionId: string) {
    await this.db.session.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date(), revokedReason: 'user_logout' },
    });
    return { ok: true };
  }

  async logoutAll(userId: string) {
    const result = await this.db.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date(), revokedReason: 'user_logout_all' },
    });
    return { ok: true, revokedSessions: result.count };
  }

  listSessions(userId: string) {
    return this.db.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const result = await this.db.session.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date(), revokedReason: 'user_revoked' },
    });
    if (result.count !== 1) {
      throw new BadRequestException('Session not found');
    }
    return { ok: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.db.user.findUniqueOrThrow({ where: { id: userId } });
    const valid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different');
    }
    try {
      assertPasswordIsNotCommon(dto.newPassword);
    } catch {
      throw new BadRequestException('Password is too common');
    }

    const passwordHash = await argon2.hash(dto.newPassword, this.argonOptions());
    await this.db.$transaction([
      this.db.user.update({
        where: { id: userId },
        data: { passwordHash, passwordChangedAt: new Date() },
      }),
      this.db.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date(), revokedReason: 'password_changed' },
      }),
    ]);
    return { ok: true };
  }

  async requestEmailVerification(emailInput: string) {
    const email = normalizeEmail(emailInput);
    const user = await this.db.user.findUnique({ where: { email } });
    if (user && user.status === UserStatus.PENDING && !user.emailVerifiedAt) {
      const token = await this.replaceOneTimeToken(
        user.id,
        TokenType.EMAIL_VERIFICATION,
        30,
      );
      await this.queueVerification(user, token);
      return {
        accepted: true,
        ...this.developmentToken('verificationToken', token),
      };
    }
    return { accepted: true };
  }

  async verifyEmail(token: string) {
    const tokenHash = hashOpaqueToken(token);
    const record = await this.db.oneTimeToken.findUnique({
      where: { tokenHash },
    });
    if (
      !record ||
      record.type !== TokenType.EMAIL_VERIFICATION ||
      record.usedAt ||
      record.expiresAt <= new Date()
    ) {
      throw new BadRequestException('Verification token is invalid or expired');
    }

    await this.db.$transaction(async (transaction) => {
      const consumed = await transaction.oneTimeToken.updateMany({
        where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });
      if (consumed.count !== 1) {
        throw new BadRequestException('Verification token is invalid or expired');
      }
      await transaction.user.update({
        where: { id: record.userId },
        data: { status: UserStatus.ACTIVE, emailVerifiedAt: new Date() },
      });
    });
    return { ok: true };
  }

  async requestPasswordReset(emailInput: string) {
    const email = normalizeEmail(emailInput);
    const user = await this.db.user.findUnique({ where: { email } });
    if (user && user.status !== UserStatus.DISABLED) {
      const token = await this.replaceOneTimeToken(
        user.id,
        TokenType.PASSWORD_RESET,
        20,
      );
      await this.notifications.queue(
        user.id,
        'EMAIL',
        'PASSWORD_RESET',
        user.email,
        {
          url: `${this.config.get<string>('APP_URL', 'http://localhost:3000')}/reset-password?token=${token}`,
          expiresInMinutes: 20,
        },
      );
      return {
        accepted: true,
        ...this.developmentToken('resetToken', token),
      };
    }
    return { accepted: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      assertPasswordIsNotCommon(dto.newPassword);
    } catch {
      throw new BadRequestException('Password is too common');
    }

    const record = await this.db.oneTimeToken.findUnique({
      where: { tokenHash: hashOpaqueToken(dto.token) },
    });
    if (
      !record ||
      record.type !== TokenType.PASSWORD_RESET ||
      record.usedAt ||
      record.expiresAt <= new Date()
    ) {
      throw new BadRequestException('Reset token is invalid or expired');
    }

    const passwordHash = await argon2.hash(
      dto.newPassword,
      this.argonOptions(),
    );
    await this.db.$transaction(async (transaction) => {
      const consumed = await transaction.oneTimeToken.updateMany({
        where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });
      if (consumed.count !== 1) {
        throw new BadRequestException('Reset token is invalid or expired');
      }
      await transaction.user.update({
        where: { id: record.userId },
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
      await transaction.session.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date(), revokedReason: 'password_reset' },
      });
    });
    return { ok: true };
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async deleteExpiredSecurityRecords(): Promise<void> {
    const now = new Date();
    await this.db.$transaction([
      this.db.session.deleteMany({ where: { expiresAt: { lte: now } } }),
      this.db.oneTimeToken.deleteMany({ where: { expiresAt: { lte: now } } }),
    ]);
  }

  private async createAuthenticatedSession(
    user: SafeUser,
    context: RequestContext,
  ) {
    await this.pruneSessions(user.id);
    const refreshTtlSeconds = this.config.get<number>(
      'JWT_REFRESH_TTL_SECONDS',
      604800,
    );
    const session = await this.db.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: 'pending',
        expiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
    });
    const tokens = await this.issueTokens(user, session.id, 0);
    await this.db.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: await argon2.hash(
          tokens.refreshToken,
          this.argonOptions(),
        ),
      },
    });
    return { user: this.safeUser(user), ...tokens };
  }

  private async issueTokens(
    user: SafeUser,
    sessionId: string,
    tokenVersion: number,
  ) {
    const issuer = this.config.get<string>('JWT_ISSUER', 'novavolt-api');
    const audience = this.config.get<string>(
      'JWT_AUDIENCE',
      'novavolt-clients',
    );
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        {
          sub: user.id,
          sid: sessionId,
          role: user.role,
          type: 'access',
        },
        {
          secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.config.get<number>('JWT_ACCESS_TTL_SECONDS', 900),
          issuer,
          audience,
        },
      ),
      this.jwt.signAsync(
        {
          sub: user.id,
          sid: sessionId,
          ver: tokenVersion,
          type: 'refresh',
        },
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get<number>(
            'JWT_REFRESH_TTL_SECONDS',
            604800,
          ),
          issuer,
          audience,
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async recordFailedLogin(
    userId: string,
    currentAttempts: number,
  ): Promise<void> {
    const attempts = currentAttempts + 1;
    const maximum = this.config.get<number>('AUTH_MAX_FAILED_ATTEMPTS', 5);
    const lockMinutes = this.config.get<number>('AUTH_LOCK_MINUTES', 15);
    await this.db.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: attempts >= maximum ? 0 : attempts,
        lockedUntil:
          attempts >= maximum
            ? new Date(Date.now() + lockMinutes * 60_000)
            : undefined,
      },
    });
  }

  private async pruneSessions(userId: string): Promise<void> {
    await this.db.session.deleteMany({
      where: {
        userId,
        OR: [{ expiresAt: { lte: new Date() } }, { revokedAt: { not: null } }],
      },
    });
    const maximum = this.config.get<number>('MAX_ACTIVE_SESSIONS', 10);
    const sessions = await this.db.session.findMany({
      where: { userId, revokedAt: null },
      orderBy: { lastUsedAt: 'desc' },
      select: { id: true },
      skip: Math.max(0, maximum - 1),
    });
    if (sessions.length) {
      await this.db.session.updateMany({
        where: { id: { in: sessions.map(({ id }) => id) } },
        data: { revokedAt: new Date(), revokedReason: 'session_limit' },
      });
    }
  }

  private async replaceOneTimeToken(
    userId: string,
    type: TokenType,
    expiresInMinutes: number,
  ): Promise<string> {
    const token = createOpaqueToken();
    await this.db.$transaction([
      this.db.oneTimeToken.deleteMany({ where: { userId, type, usedAt: null } }),
      this.db.oneTimeToken.create({
        data: {
          userId,
          type,
          tokenHash: hashOpaqueToken(token),
          expiresAt: new Date(Date.now() + expiresInMinutes * 60_000),
        },
      }),
    ]);
    return token;
  }

  private queueVerification(user: SafeUser, token: string) {
    return this.notifications.queue(
      user.id,
      'EMAIL',
      'EMAIL_VERIFICATION',
      user.email,
      {
        url: `${this.config.get<string>('APP_URL', 'http://localhost:3000')}/verify-email?token=${token}`,
        expiresInMinutes: 30,
      },
    );
  }

  private developmentToken(key: string, token: string): Record<string, string> {
    return this.config.get<boolean>('EXPOSE_DEVELOPMENT_TOKENS', false)
      ? { [key]: token }
      : {};
  }

  private safeUser(user: SafeUser): SafeUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }

  private argonOptions(): argon2.Options & { raw?: false } {
    return {
      type: argon2.argon2id,
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
    };
  }
}

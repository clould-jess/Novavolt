import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma.service';

const defaultAdminConfig = {
  email: 'admin@novavolt.local',
  password: 'ChangeThisDefaultAdminPass1!',
  firstName: 'Admin',
  lastName: 'Novavolt',
};

@Injectable()
export class AdminBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const email = this.config
        .get<string>('DEFAULT_ADMIN_EMAIL', defaultAdminConfig.email)
        .trim()
        .toLowerCase();
      const password = this.config.get<string>(
        'DEFAULT_ADMIN_PASSWORD',
        defaultAdminConfig.password,
      );
      const firstName = this.config
        .get<string>('DEFAULT_ADMIN_FIRST_NAME', defaultAdminConfig.firstName)
        .trim();
      const lastName = this.config
        .get<string>('DEFAULT_ADMIN_LAST_NAME', defaultAdminConfig.lastName)
        .trim();

      if (
        password.length < 16 ||
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])/.test(password)
      ) {
        throw new Error('DEFAULT_ADMIN_PASSWORD does not meet the admin policy');
      }

      const activeAdmin = await this.db.user.findFirst({
        where: { role: Role.ADMIN, status: UserStatus.ACTIVE },
        select: { id: true, email: true },
      });
      if (activeAdmin) {
        this.logger.log(
          `Active admin already exists, bootstrap skipped: ${activeAdmin.email}`,
        );
        return;
      }

      const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 19_456,
        timeCost: 2,
        parallelism: 1,
      });

      await this.db.user.upsert({
        where: { email },
        update: {
          passwordHash,
          role: Role.ADMIN,
          status: UserStatus.ACTIVE,
          emailVerifiedAt: new Date(),
          profile: {
            upsert: {
              create: { firstName, lastName },
              update: { firstName, lastName },
            },
          },
        },
        create: {
          email,
          passwordHash,
          role: Role.ADMIN,
          status: UserStatus.ACTIVE,
          emailVerifiedAt: new Date(),
          profile: {
            create: { firstName, lastName },
          },
        },
      });

      this.logger.log(`Default admin account is ready: ${email}`);
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : 'Unknown admin bootstrap error';
      this.logger.warn(`Admin bootstrap skipped during startup: ${message}`);
    }
  }
}

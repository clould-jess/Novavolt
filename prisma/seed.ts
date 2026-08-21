import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const db = new PrismaClient();

async function main(): Promise<void> {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.ALLOW_PRODUCTION_SEED !== 'true'
  ) {
    throw new Error('Production seed is disabled');
  }

  const email = process.env.SEED_OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_OWNER_PASSWORD;
  const firstName = process.env.SEED_OWNER_FIRST_NAME?.trim();
  const lastName = process.env.SEED_OWNER_LAST_NAME?.trim();
  if (!email || !password || !firstName || !lastName) {
    throw new Error('All SEED_OWNER_* values are required');
  }
  if (
    password.length < 16 ||
    !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])/.test(password)
  ) {
    throw new Error('SEED_OWNER_PASSWORD does not meet the owner policy');
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });
  await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      role: Role.OWNER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: { create: { firstName, lastName } },
    },
  });
  console.info(`Owner account is ready: ${email}`);
}

main()
  .finally(async () => db.$disconnect())
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Seed failed');
    process.exitCode = 1;
  });

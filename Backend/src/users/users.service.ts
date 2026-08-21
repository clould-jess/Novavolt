import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateProfileDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private readonly db: PrismaService) {}

  me(userId: string) {
    return this.db.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        profile: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }

  updateProfile(userId: string, dto: UpdateProfileDto) {
    const data = {
      ...dto,
      ...(dto.postalCode
        ? { postalCode: dto.postalCode.toUpperCase().replace(/\s+/g, ' ') }
        : {}),
    };
    return this.db.customerProfile.update({
      where: { userId },
      data,
    });
  }
}

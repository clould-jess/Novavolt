import { Role, UserStatus } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  sessionId: string;
}

export interface RequestContext {
  ipAddress?: string;
  requestId?: string;
  userAgent?: string;
}

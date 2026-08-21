import { RentalStatus } from '@prisma/client';

const allowedTransitions: Record<RentalStatus, RentalStatus[]> = {
  PENDING: [RentalStatus.ACTIVE, RentalStatus.CANCELLED],
  ACTIVE: [RentalStatus.OVERDUE, RentalStatus.COMPLETED, RentalStatus.CANCELLED],
  OVERDUE: [RentalStatus.ACTIVE, RentalStatus.COMPLETED, RentalStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionRental(
  from: RentalStatus,
  to: RentalStatus,
): boolean {
  return allowedTransitions[from].includes(to);
}

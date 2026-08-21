import { RentalStatus } from '@prisma/client';
import { canTransitionRental } from './rental-rules';

describe('rental state transitions', () => {
  it('allows activation of a pending rental', () => {
    expect(
      canTransitionRental(RentalStatus.PENDING, RentalStatus.ACTIVE),
    ).toBe(true);
  });

  it('allows overdue recovery back to active', () => {
    expect(
      canTransitionRental(RentalStatus.OVERDUE, RentalStatus.ACTIVE),
    ).toBe(true);
  });

  it('prevents reopening a completed rental', () => {
    expect(
      canTransitionRental(RentalStatus.COMPLETED, RentalStatus.ACTIVE),
    ).toBe(false);
  });

  it('prevents an active rental returning to pending', () => {
    expect(
      canTransitionRental(RentalStatus.ACTIVE, RentalStatus.PENDING),
    ).toBe(false);
  });
});

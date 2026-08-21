import { BadRequestException } from '@nestjs/common';

export function parseBookingInterval(
  startInput: string,
  endInput: string,
  now = new Date(),
): { startAt: Date; endAt: Date } {
  const startAt = new Date(startInput);
  const endAt = new Date(endInput);
  if (
    Number.isNaN(startAt.getTime()) ||
    Number.isNaN(endAt.getTime()) ||
    startAt >= endAt
  ) {
    throw new BadRequestException('Invalid booking interval');
  }
  if (startAt.getTime() < now.getTime() - 5 * 60_000) {
    throw new BadRequestException('Booking cannot start in the past');
  }
  if (endAt.getTime() - startAt.getTime() > 180 * 24 * 60 * 60_000) {
    throw new BadRequestException('Booking cannot exceed 180 days');
  }
  return { startAt, endAt };
}

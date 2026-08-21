import { BadRequestException } from '@nestjs/common';
import { parseBookingInterval } from './booking-rules';

describe('booking interval rules', () => {
  const now = new Date('2026-08-21T12:00:00.000Z');

  it('parses a valid interval', () => {
    const interval = parseBookingInterval(
      '2026-08-22T12:00:00.000Z',
      '2026-08-29T12:00:00.000Z',
      now,
    );
    expect(interval.startAt.toISOString()).toBe('2026-08-22T12:00:00.000Z');
  });

  it('rejects an inverted interval', () => {
    expect(() =>
      parseBookingInterval(
        '2026-08-23T12:00:00.000Z',
        '2026-08-22T12:00:00.000Z',
        now,
      ),
    ).toThrow(BadRequestException);
  });

  it('rejects a booking in the past', () => {
    expect(() =>
      parseBookingInterval(
        '2026-08-20T12:00:00.000Z',
        '2026-08-22T12:00:00.000Z',
        now,
      ),
    ).toThrow('Booking cannot start in the past');
  });

  it('rejects a booking longer than 180 days', () => {
    expect(() =>
      parseBookingInterval(
        '2026-08-22T12:00:00.000Z',
        '2027-03-01T12:00:00.000Z',
        now,
      ),
    ).toThrow('Booking cannot exceed 180 days');
  });
});

import { addDays, format } from 'date-fns';
import type { DayStatus, VehicleAvailability } from '../types';

const REFERENCE = new Date(2026, 7, 17); // 17 août 2026, point de départ des données de démonstration

function hashSeed(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

/** Deterministic pseudo-random pattern so the calendar is stable between renders. */
function statusFor(vehicleSeed: number, dayIndex: number): DayStatus {
  const seed = (vehicleSeed * 7 + dayIndex * 3) % 17;
  if (seed === 4 || seed === 5) return 'reserved';
  if (seed === 9 || seed === 10 || seed === 11) return 'rented';
  if (seed === 15) return 'maintenance';
  return 'available';
}

function buildAvailability(vehicleId: string): VehicleAvailability {
  const vehicleSeed = hashSeed(vehicleId);
  return {
    vehicleId,
    days: Array.from({ length: 90 }, (_, dayIndex) => ({
      date: format(addDays(REFERENCE, dayIndex), 'yyyy-MM-dd'),
      status: statusFor(vehicleSeed, dayIndex),
    })),
  };
}

export function availabilityFor(vehicleId: string) {
  return buildAvailability(vehicleId).days;
}

export const availabilityReferenceDate = REFERENCE;

import { addDays, format } from 'date-fns';
import type { DayStatus, VehicleAvailability } from '../types';
import { mockVehicles } from './vehicles';

const REFERENCE = new Date(2026, 7, 17); // 17 août 2026, point de départ des données de démonstration

/** Deterministic pseudo-random pattern so the mock calendar is stable between renders. */
function statusFor(vehicleIndex: number, dayIndex: number): DayStatus {
  const seed = (vehicleIndex * 7 + dayIndex * 3) % 17;
  if (seed === 4 || seed === 5) return 'reserved';
  if (seed === 9 || seed === 10 || seed === 11) return 'rented';
  if (seed === 15) return 'maintenance';
  return 'available';
}

export const mockAvailability: VehicleAvailability[] = mockVehicles.map((vehicle, vehicleIndex) => ({
  vehicleId: vehicle.id,
  days: Array.from({ length: 90 }, (_, dayIndex) => ({
    date: format(addDays(REFERENCE, dayIndex), 'yyyy-MM-dd'),
    status: statusFor(vehicleIndex, dayIndex)
  }))
}));

export function availabilityFor(vehicleId: string) {
  return mockAvailability.find((entry) => entry.vehicleId === vehicleId)?.days ?? [];
}

export const availabilityReferenceDate = REFERENCE;
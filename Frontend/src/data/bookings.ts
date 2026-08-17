import type { Booking, Rental } from '../types';

/** Mock bookings — replace with GET /api/bookings. */
export const mockBookings: Booking[] = [
{
  id: 'bk-001',
  reference: 'NV-24815',
  vehicleId: 'nv-001',
  customerId: 'cus-001',
  startDate: '2026-08-18',
  endDate: '2026-08-25',
  plan: 'weekly',
  city: 'montreal',
  status: 'confirmed',
  total: 329,
  createdAt: '2026-08-12'
},
{
  id: 'bk-002',
  reference: 'NV-24816',
  vehicleId: 'nv-002',
  customerId: 'cus-002',
  startDate: '2026-08-21',
  endDate: '2026-08-24',
  plan: 'daily',
  city: 'toronto',
  status: 'pending',
  total: 285,
  createdAt: '2026-08-13'
},
{
  id: 'bk-003',
  reference: 'NV-24817',
  vehicleId: 'nv-004',
  customerId: 'cus-003',
  startDate: '2026-08-26',
  endDate: '2026-09-09',
  plan: 'weekly',
  city: 'ottawa',
  status: 'pending',
  total: 758,
  createdAt: '2026-08-14'
},
{
  id: 'bk-004',
  reference: 'NV-24810',
  vehicleId: 'nv-005',
  customerId: 'cus-006',
  startDate: '2026-07-11',
  endDate: '2026-07-18',
  plan: 'weekly',
  city: 'vancouver',
  status: 'completed',
  total: 299,
  createdAt: '2026-07-02'
},
{
  id: 'bk-005',
  reference: 'NV-24818',
  vehicleId: 'nv-006',
  customerId: 'cus-005',
  startDate: '2026-08-19',
  endDate: '2026-09-16',
  plan: 'monthly',
  city: 'montreal',
  status: 'confirmed',
  total: 899,
  createdAt: '2026-08-10'
},
{
  id: 'bk-006',
  reference: 'NV-24819',
  vehicleId: 'nv-003',
  customerId: 'cus-007',
  startDate: '2026-08-30',
  endDate: '2026-09-06',
  plan: 'weekly',
  city: 'montreal',
  status: 'cancelled',
  total: 359,
  createdAt: '2026-08-15'
}];


/** Mock rentals — replace with GET /api/rentals. */
export const mockRentals: Rental[] = [
{
  id: 'ren-001',
  reference: 'LOC-9042',
  vehicleId: 'nv-001',
  customerId: 'cus-001',
  startDate: '2026-08-11',
  endDate: '2026-08-18',
  stage: 'active',
  pickupAddress: '4210 rue Saint-Denis, Montréal, QC',
  chargeAtPickup: 96,
  odometerAtPickup: 42180,
  weeklyRate: 329
},
{
  id: 'ren-002',
  reference: 'LOC-9043',
  vehicleId: 'nv-002',
  customerId: 'cus-002',
  startDate: '2026-08-14',
  endDate: '2026-08-21',
  stage: 'returnDue',
  pickupAddress: '188 King Street West, Toronto, ON',
  chargeAtPickup: 100,
  odometerAtPickup: 31025,
  weeklyRate: 399
},
{
  id: 'ren-003',
  reference: 'LOC-9044',
  vehicleId: 'nv-006',
  customerId: 'cus-005',
  startDate: '2026-08-16',
  endDate: '2026-09-13',
  stage: 'ready',
  pickupAddress: '2755 boulevard Décarie, Montréal, QC',
  chargeAtPickup: 88,
  odometerAtPickup: 61230,
  weeklyRate: 249
}];


export function getBooking(id: string) {
  return mockBookings.find((booking) => booking.id === id);
}

export function getRental(id: string) {
  return mockRentals.find((rental) => rental.id === id);
}
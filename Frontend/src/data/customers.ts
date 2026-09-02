import type { Customer } from '../types';

/** Mock customers — replace with GET /api/customers. */
export const mockCustomers: Customer[] = [
{
  id: 'cus-001',
  firstName: 'Karim',
  lastName: 'Benali',
  email: 'karim.benali@example.ca',
  phone: '+1 (514) 555-0142',
  profile: 'driver',
  city: 'montreal',
  fileStatus: 'actionRequired',
  activeRentalId: 'ren-001',
  balanceDue: 329,
  createdAt: '2026-06-02'
},
{
  id: 'cus-002',
  firstName: 'Julie',
  lastName: 'Lachance',
  email: 'julie.lachance@example.ca',
  phone: '+1 (416) 555-0198',
  profile: 'individual',
  city: 'montreal',
  fileStatus: 'approved',
  activeRentalId: 'ren-002',
  balanceDue: 0,
  createdAt: '2026-05-18'
},
{
  id: 'cus-003',
  firstName: 'Daniel',
  lastName: 'Okonkwo',
  email: 'daniel.okonkwo@example.ca',
  phone: '+1 (613) 555-0177',
  profile: 'driver',
  city: 'montreal',
  fileStatus: 'review',
  activeRentalId: null,
  balanceDue: 0,
  createdAt: '2026-07-09'
},
{
  id: 'cus-004',
  firstName: 'Mei',
  lastName: 'Tanaka',
  email: 'mei.tanaka@example.ca',
  phone: '+1 (604) 555-0120',
  profile: 'individual',
  city: 'montreal',
  fileStatus: 'incomplete',
  activeRentalId: null,
  balanceDue: 0,
  createdAt: '2026-08-04'
},
{
  id: 'cus-005',
  firstName: 'Samuel',
  lastName: 'Roy',
  email: 'samuel.roy@example.ca',
  phone: '+1 (514) 555-0163',
  profile: 'driver',
  city: 'montreal',
  fileStatus: 'approved',
  activeRentalId: 'ren-003',
  balanceDue: 152,
  createdAt: '2026-03-27'
},
{
  id: 'cus-006',
  firstName: 'Amélie',
  lastName: 'Fortin',
  email: 'amelie.fortin@example.ca',
  phone: '+1 (418) 555-0109',
  profile: 'individual',
  city: 'montreal',
  fileStatus: 'approved',
  activeRentalId: null,
  balanceDue: 0,
  createdAt: '2026-04-15'
},
{
  id: 'cus-007',
  firstName: 'Owen',
  lastName: 'Mitchell',
  email: 'owen.mitchell@example.ca',
  phone: '+1 (416) 555-0111',
  profile: 'driver',
  city: 'montreal',
  fileStatus: 'actionRequired',
  activeRentalId: null,
  balanceDue: 79,
  createdAt: '2026-07-30'
},
{
  id: 'cus-008',
  firstName: 'Sofia',
  lastName: 'Marchetti',
  email: 'sofia.marchetti@example.ca',
  phone: '+1 (604) 555-0155',
  profile: 'individual',
  city: 'montreal',
  fileStatus: 'review',
  activeRentalId: null,
  balanceDue: 0,
  createdAt: '2026-08-11'
}];


/** The signed-in demo customer for the client portal. */
export const currentCustomer = mockCustomers[0];

export function getCustomer(id: string): Customer | undefined {
  return mockCustomers.find((customer) => customer.id === id);
}

export function customerName(customer: Customer): string {
  return `${customer.firstName} ${customer.lastName}`;
}
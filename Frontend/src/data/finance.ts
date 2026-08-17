import type { Deposit, Invoice, Payment } from '../types';

/** Mock invoices — replace with GET /api/invoices. */
export const mockInvoices: Invoice[] = [
{ id: 'inv-001', number: 'F-2026-0451', customerId: 'cus-001', amount: 329, status: 'paid', issuedAt: '2026-08-04', dueAt: '2026-08-04', period: '4 – 11 août 2026' },
{ id: 'inv-002', number: 'F-2026-0478', customerId: 'cus-001', amount: 329, status: 'upcoming', issuedAt: '2026-08-11', dueAt: '2026-08-18', period: '11 – 18 août 2026' },
{ id: 'inv-003', number: 'F-2026-0412', customerId: 'cus-001', amount: 329, status: 'paid', issuedAt: '2026-07-28', dueAt: '2026-07-28', period: '28 juillet – 4 août 2026' },
{ id: 'inv-004', number: 'F-2026-0480', customerId: 'cus-002', amount: 399, status: 'paid', issuedAt: '2026-08-14', dueAt: '2026-08-14', period: '14 – 21 août 2026' },
{ id: 'inv-005', number: 'F-2026-0481', customerId: 'cus-005', amount: 899, status: 'late', issuedAt: '2026-08-01', dueAt: '2026-08-08', period: 'Août 2026' },
{ id: 'inv-006', number: 'F-2026-0483', customerId: 'cus-007', amount: 79, status: 'failed', issuedAt: '2026-08-15', dueAt: '2026-08-15', period: 'Journée du 15 août 2026' },
{ id: 'inv-007', number: 'F-2026-0390', customerId: 'cus-006', amount: 299, status: 'refunded', issuedAt: '2026-07-11', dueAt: '2026-07-11', period: '11 – 18 juillet 2026' },
{ id: 'inv-008', number: 'F-2026-0484', customerId: 'cus-003', amount: 379, status: 'upcoming', issuedAt: '2026-08-16', dueAt: '2026-08-26', period: '26 août – 2 sept. 2026' }];


/** Mock payments — replace with GET /api/payments. */
export const mockPayments: Payment[] = [
{ id: 'pay-001', invoiceId: 'inv-001', customerId: 'cus-001', amount: 329, method: 'card', status: 'paid', processedAt: '2026-08-04' },
{ id: 'pay-002', invoiceId: 'inv-003', customerId: 'cus-001', amount: 329, method: 'card', status: 'paid', processedAt: '2026-07-28' },
{ id: 'pay-003', invoiceId: 'inv-004', customerId: 'cus-002', amount: 399, method: 'card', status: 'paid', processedAt: '2026-08-14' },
{ id: 'pay-004', invoiceId: 'inv-006', customerId: 'cus-007', amount: 79, method: 'card', status: 'failed', processedAt: '2026-08-15' },
{ id: 'pay-005', invoiceId: 'inv-005', customerId: 'cus-005', amount: 899, method: 'transfer', status: 'late', processedAt: '2026-08-08' },
{ id: 'pay-006', invoiceId: 'inv-007', customerId: 'cus-006', amount: 299, method: 'card', status: 'refunded', processedAt: '2026-07-19' }];


/** Mock deposits — replace with GET /api/deposits. */
export const mockDeposits: Deposit[] = [
{ id: 'dep-001', customerId: 'cus-001', rentalId: 'ren-001', amount: 500, status: 'held', updatedAt: '2026-08-11' },
{ id: 'dep-002', customerId: 'cus-002', rentalId: 'ren-002', amount: 600, status: 'held', updatedAt: '2026-08-14' },
{ id: 'dep-003', customerId: 'cus-005', rentalId: 'ren-003', amount: 400, status: 'released', updatedAt: '2026-08-16' },
{ id: 'dep-004', customerId: 'cus-006', rentalId: 'ren-003', amount: 450, status: 'refunded', updatedAt: '2026-07-21' }];


export function invoicesFor(customerId: string) {
  return mockInvoices.filter((invoice) => invoice.customerId === customerId);
}

export function depositsFor(customerId: string) {
  return mockDeposits.filter((deposit) => deposit.customerId === customerId);
}

export function paymentsFor(customerId: string) {
  return mockPayments.filter((payment) => payment.customerId === customerId);
}
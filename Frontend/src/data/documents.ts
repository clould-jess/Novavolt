import type { Contract, CustomerDocument } from '../types';

/** Mock documents — replace with GET /api/customers/:id/documents. */
export const mockDocuments: CustomerDocument[] = [
{
  id: 'doc-001',
  customerId: 'cus-001',
  type: 'licence',
  label: 'Permis de conduire',
  status: 'approved',
  updatedAt: '2026-06-04',
  expiresAt: '2028-03-19',
  requiredFor: ['driver', 'individual']
},
{
  id: 'doc-002',
  customerId: 'cus-001',
  type: 'identity',
  label: 'Pièce d’identité',
  status: 'approved',
  updatedAt: '2026-06-04',
  requiredFor: ['driver', 'individual']
},
{
  id: 'doc-003',
  customerId: 'cus-001',
  type: 'address',
  label: 'Justificatif d’adresse',
  status: 'rejected',
  updatedAt: '2026-08-13',
  note: 'Document illisible',
  requiredFor: ['driver', 'individual']
},
{
  id: 'doc-004',
  customerId: 'cus-001',
  type: 'driverProfile',
  label: 'Profil de conducteur de plateforme',
  status: 'review',
  updatedAt: '2026-08-14',
  requiredFor: ['driver']
},
{
  id: 'doc-005',
  customerId: 'cus-001',
  type: 'insurance',
  label: 'Attestation d’assurance',
  status: 'expiring',
  updatedAt: '2026-02-01',
  expiresAt: '2026-09-01',
  requiredFor: ['driver']
},
{
  id: 'doc-006',
  customerId: 'cus-003',
  type: 'licence',
  label: 'Permis de conduire',
  status: 'review',
  updatedAt: '2026-08-15',
  requiredFor: ['driver', 'individual']
},
{
  id: 'doc-007',
  customerId: 'cus-003',
  type: 'address',
  label: 'Justificatif d’adresse',
  status: 'submitted',
  updatedAt: '2026-08-15',
  requiredFor: ['driver', 'individual']
},
{
  id: 'doc-008',
  customerId: 'cus-004',
  type: 'licence',
  label: 'Permis de conduire',
  status: 'required',
  updatedAt: '2026-08-04',
  requiredFor: ['driver', 'individual']
},
{
  id: 'doc-009',
  customerId: 'cus-007',
  type: 'driverProfile',
  label: 'Profil de conducteur de plateforme',
  status: 'rejected',
  updatedAt: '2026-08-12',
  note: 'Capture d’écran incomplète',
  requiredFor: ['driver']
},
{
  id: 'doc-010',
  customerId: 'cus-008',
  type: 'identity',
  label: 'Pièce d’identité',
  status: 'review',
  updatedAt: '2026-08-16',
  requiredFor: ['driver', 'individual']
}];


/** Mock contracts — replace with GET /api/contracts. */
export const mockContracts: Contract[] = [
{
  id: 'con-001',
  reference: 'CTR-2026-0142',
  customerId: 'cus-001',
  vehicleId: 'nv-001',
  status: 'signed',
  createdAt: '2026-08-10',
  signedAt: '2026-08-11'
},
{
  id: 'con-002',
  reference: 'CTR-2026-0158',
  customerId: 'cus-001',
  vehicleId: 'nv-001',
  status: 'toSign',
  createdAt: '2026-08-16'
},
{
  id: 'con-003',
  reference: 'CTR-2026-0121',
  customerId: 'cus-002',
  vehicleId: 'nv-002',
  status: 'signed',
  createdAt: '2026-08-12',
  signedAt: '2026-08-13'
},
{
  id: 'con-004',
  reference: 'CTR-2026-0099',
  customerId: 'cus-005',
  vehicleId: 'nv-006',
  status: 'toSign',
  createdAt: '2026-08-15'
},
{
  id: 'con-005',
  reference: 'CTR-2026-0077',
  customerId: 'cus-006',
  vehicleId: 'nv-005',
  status: 'expired',
  createdAt: '2026-07-02',
  signedAt: '2026-07-03'
}];


export function documentsFor(customerId: string) {
  return mockDocuments.filter((doc) => doc.customerId === customerId);
}

export function contractsFor(customerId: string) {
  return mockContracts.filter((contract) => contract.customerId === customerId);
}
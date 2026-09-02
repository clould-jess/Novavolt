import type { Incident, MaintenanceOrder, Notification } from '../types';

/** Mock maintenance orders — replace with GET /api/maintenance. */
export const mockMaintenance: MaintenanceOrder[] = [
{ id: 'mnt-001', vehicleId: 'nv-007', type: 'Inspection freins et pneus', status: 'inProgress', scheduledAt: '2026-08-19', cost: 340, assignee: 'Atelier Décarie' },
{ id: 'mnt-002', vehicleId: 'nv-006', type: 'Entretien 60 000 km', status: 'planned', scheduledAt: '2026-08-22', cost: 280, assignee: 'Atelier Décarie' },
{ id: 'mnt-003', vehicleId: 'nv-002', type: 'Mise à jour logicielle', status: 'planned', scheduledAt: '2026-08-30', cost: 0, assignee: 'Équipe flotte' },
{ id: 'mnt-004', vehicleId: 'nv-001', type: 'Rotation des pneus', status: 'done', scheduledAt: '2026-07-14', cost: 120, assignee: 'Atelier Saint-Denis' },
{ id: 'mnt-005', vehicleId: 'nv-005', type: 'Diagnostic batterie', status: 'planned', scheduledAt: '2026-09-05', cost: 190, assignee: 'Atelier Montréal' },
{ id: 'mnt-006', vehicleId: 'nv-004', type: 'Nettoyage complet', status: 'done', scheduledAt: '2026-08-02', cost: 90, assignee: 'Équipe flotte' }];


/** Mock incidents — replace with GET /api/incidents. */
export const mockIncidents: Incident[] = [
{
  id: 'inc-001',
  reference: 'INC-3021',
  customerId: 'cus-001',
  vehicleId: 'nv-001',
  category: 'Recharge',
  severity: 'medium',
  status: 'assigned',
  createdAt: '2026-08-15',
  assignee: 'Léa (support)',
  description: 'Borne partenaire refuse la carte de recharge sur le boulevard Saint-Laurent.'
},
{
  id: 'inc-002',
  reference: 'INC-3022',
  customerId: 'cus-002',
  vehicleId: 'nv-002',
  category: 'Dommage',
  severity: 'low',
  status: 'open',
  createdAt: '2026-08-16',
  assignee: null,
  description: 'Éclat de pare-brise côté passager constaté au retour de route.'
},
{
  id: 'inc-003',
  reference: 'INC-3018',
  customerId: 'cus-005',
  vehicleId: 'nv-006',
  category: 'Panne',
  severity: 'high',
  status: 'resolved',
  createdAt: '2026-08-06',
  assignee: 'Marc (flotte)',
  description: 'Véhicule immobilisé, remorquage effectué et véhicule de remplacement fourni.'
}];


/** Mock notifications — replace with GET /api/notifications. */
export const mockNotifications: Notification[] = [
{ id: 'not-001', kind: 'document', titleKey: 'docStatus.rejected', bodyKey: 'portal.docsMissing', createdAt: '2026-08-13', read: false },
{ id: 'not-002', kind: 'payment', titleKey: 'portal.nextPayment', bodyKey: 'invoiceStatus.upcoming', createdAt: '2026-08-12', read: false },
{ id: 'not-003', kind: 'rental', titleKey: 'rentalStage.active', bodyKey: 'portal.rentalTitle', createdAt: '2026-08-11', read: true },
{ id: 'not-004', kind: 'support', titleKey: 'incidentStatus.assigned', bodyKey: 'portal.incidentHistory', createdAt: '2026-08-15', read: true }];
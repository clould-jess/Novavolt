import type { DashboardKPIs } from '../types';

/** Mock admin KPIs — replace with GET /api/admin/kpis. */
export const mockDashboardKPIs: DashboardKPIs = {
  vehiclesAvailable: 12,
  vehiclesRented: 21,
  vehiclesMaintenance: 3,
  revenueWeek: 11480,
  revenueMonth: 46215,
  paymentsUpcoming: 8,
  paymentsFailed: 2,
  utilisationRate: 78
};

export const revenueSeries = [
{ label: 'S24', revenue: 8420, target: 9000 },
{ label: 'S25', revenue: 9110, target: 9000 },
{ label: 'S26', revenue: 8870, target: 9200 },
{ label: 'S27', revenue: 10240, target: 9500 },
{ label: 'S28', revenue: 10890, target: 9800 },
{ label: 'S29', revenue: 10120, target: 10000 },
{ label: 'S30', revenue: 11480, target: 10500 }];


export const utilisationSeries = [
{ label: 'S24', utilisation: 62 },
{ label: 'S25', utilisation: 68 },
{ label: 'S26', utilisation: 66 },
{ label: 'S27', utilisation: 71 },
{ label: 'S28', utilisation: 74 },
{ label: 'S29', utilisation: 76 },
{ label: 'S30', utilisation: 78 }];


export const paymentStatusSeries = [
{ key: 'paid', value: 64 },
{ key: 'upcoming', value: 22 },
{ key: 'late', value: 9 },
{ key: 'failed', value: 5 }];


export const cityPerformance = [
{ city: 'montreal', revenue: 46215, occupancy: 78, vehicles: 12 }
];


export const vehiclePerformance = [
{ vehicleId: 'nv-001', revenue: 5264, days: 26, maintenanceCost: 120 },
{ vehicleId: 'nv-002', revenue: 6384, days: 24, maintenanceCost: 0 },
{ vehicleId: 'nv-004', revenue: 4548, days: 22, maintenanceCost: 90 },
{ vehicleId: 'nv-006', revenue: 2988, days: 28, maintenanceCost: 280 },
{ vehicleId: 'nv-007', revenue: 2444, days: 14, maintenanceCost: 340 }];


export const urgentActions = [
{ id: 'ua-1', labelKey: 'admin.urgent.docs', count: 5, to: '/admin/dossiers', tone: 'warn' as const },
{ id: 'ua-2', labelKey: 'admin.urgent.failed', count: 2, to: '/admin/paiements', tone: 'bad' as const },
{ id: 'ua-3', labelKey: 'admin.urgent.handover', count: 3, to: '/admin/reservations', tone: 'info' as const },
{ id: 'ua-4', labelKey: 'admin.urgent.contracts', count: 2, to: '/admin/contrats', tone: 'warn' as const },
{ id: 'ua-5', labelKey: 'admin.urgent.maintenance', count: 3, to: '/admin/maintenance', tone: 'info' as const }];


export const activityLog = [
{ id: 'log-1', at: '2026-08-16 09:12', agent: 'Léa T.', action: 'Document approuvé : pièce d’identité' },
{ id: 'log-2', at: '2026-08-15 16:48', agent: 'Marc D.', action: 'Réservation NV-24815 confirmée' },
{ id: 'log-3', at: '2026-08-14 11:05', agent: 'Système', action: 'Paiement F-2026-0483 échoué' },
{ id: 'log-4', at: '2026-08-13 14:22', agent: 'Léa T.', action: 'Justificatif d’adresse refusé (illisible)' }];
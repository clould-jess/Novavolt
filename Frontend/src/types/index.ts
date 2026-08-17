/**
 * Domain types for Novavolt. Every shape mirrors what a REST API would return,
 * so mock data in /data can be swapped for fetch() calls without touching the UI.
 */

export type Locale = 'fr' | 'en';

export type City = 'montreal' | 'toronto' | 'ottawa' | 'vancouver';

export type Powertrain = 'electric' | 'hybrid';

export type UseCase = 'driver' | 'individual';

export type VehicleStatus = 'available' | 'reserved' | 'rented' | 'maintenance' | 'unavailable' | 'soon';

export interface VehiclePricing {
  currency: 'CAD';
  daily: number;
  weekly: number;
  monthly: number;
  deposit: number;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  powertrain: Powertrain;
  rangeKm: number;
  seats: number;
  transmission: 'automatic';
  trunkLitres: number;
  chargeKw: number;
  city: City;
  useCases: UseCase[];
  status: VehicleStatus;
  imageUrl: string;
  gallery: string[];
  pricing: VehiclePricing;
  odometerKm: number;
  plate: string;
  vin: string;
  nextMaintenance: string;
  condition: 'excellent' | 'good' | 'fair';
  highlights: string[];
}

export type DayStatus = 'available' | 'reserved' | 'rented' | 'maintenance';

export interface AvailabilityDay {
  date: string;
  status: DayStatus;
}

export interface VehicleAvailability {
  vehicleId: string;
  days: AvailabilityDay[];
}

export type BookingStatus = 'draft' | 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  reference: string;
  vehicleId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  plan: 'daily' | 'weekly' | 'monthly';
  city: City;
  status: BookingStatus;
  total: number;
  createdAt: string;
}

export type RentalStage = 'reserved' | 'contract' | 'ready' | 'active' | 'returnDue' | 'completed';

export interface Rental {
  id: string;
  reference: string;
  vehicleId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  stage: RentalStage;
  pickupAddress: string;
  chargeAtPickup: number;
  odometerAtPickup: number;
  weeklyRate: number;
}

export type FileStatus = 'incomplete' | 'review' | 'approved' | 'actionRequired';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profile: UseCase;
  city: City;
  fileStatus: FileStatus;
  activeRentalId: string | null;
  balanceDue: number;
  createdAt: string;
}

export type DocumentStatus = 'required' | 'submitted' | 'review' | 'approved' | 'rejected' | 'expiring';

export interface CustomerDocument {
  id: string;
  customerId: string;
  type: string;
  label: string;
  status: DocumentStatus;
  updatedAt: string;
  expiresAt?: string;
  note?: string;
  requiredFor: UseCase[];
}

export type ContractStatus = 'toSign' | 'signed' | 'expired';

export interface Contract {
  id: string;
  reference: string;
  customerId: string;
  vehicleId: string;
  status: ContractStatus;
  createdAt: string;
  signedAt?: string;
}

export type InvoiceStatus = 'paid' | 'upcoming' | 'late' | 'failed' | 'refunded';

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  period: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  method: 'card' | 'preauth' | 'transfer';
  status: InvoiceStatus;
  processedAt: string;
}

export type DepositStatus = 'held' | 'released' | 'refunded';

export interface Deposit {
  id: string;
  customerId: string;
  rentalId: string;
  amount: number;
  status: DepositStatus;
  updatedAt: string;
}

export type MaintenanceStatus = 'planned' | 'inProgress' | 'done';

export interface MaintenanceOrder {
  id: string;
  vehicleId: string;
  type: string;
  status: MaintenanceStatus;
  scheduledAt: string;
  cost: number;
  assignee: string;
}

export type IncidentSeverity = 'low' | 'medium' | 'high';
export type IncidentStatus = 'open' | 'assigned' | 'resolved';

export interface Incident {
  id: string;
  reference: string;
  customerId: string;
  vehicleId: string;
  category: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  assignee: string | null;
  description: string;
}

export interface Notification {
  id: string;
  kind: 'document' | 'payment' | 'rental' | 'support';
  titleKey: string;
  bodyKey: string;
  createdAt: string;
  read: boolean;
}

export interface DashboardKPIs {
  vehiclesAvailable: number;
  vehiclesRented: number;
  vehiclesMaintenance: number;
  revenueWeek: number;
  revenueMonth: number;
  paymentsUpcoming: number;
  paymentsFailed: number;
  utilisationRate: number;
}
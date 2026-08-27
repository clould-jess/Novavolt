import { apiRequest } from './api';
import type { City, Vehicle } from '../types';

export interface PublicVehiclePhoto {
  id: string;
  altText?: string | null;
  sortOrder: number;
  imagekitUrl?: string | null;
  imagekitThumbnailUrl?: string | null;
}

export interface PublicVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color?: string | null;
  city?: string | null;
  seats?: number | null;
  rangeKm?: number | null;
  description?: string | null;
  powertrain: 'ELECTRIC' | 'HYBRID' | 'PLUG_IN_HYBRID';
  weeklyRateCents: number;
  currency: string;
  status: 'AVAILABLE' | 'RESERVED';
  photos: PublicVehiclePhoto[];
}

export interface PublicVehicleListResponse {
  items: PublicVehicle[];
  total: number;
  page: number;
  limit: number;
}

function photoUrl(photo: PublicVehiclePhoto): string | undefined {
  return photo.imagekitThumbnailUrl ?? photo.imagekitUrl ?? undefined;
}

const FALLBACK_IMAGE =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%22750%22 viewBox=%220 0 1200 750%22%3E%3Crect width=%221200%22 height=%22750%22 fill=%22%23eef2f7%22/%3E%3Cpath d=%22M300 455h600l-52-145H352z%22 fill=%22%23d7e0ea%22/%3E%3Ccircle cx=%22418%22 cy=%22510%22 r=%2252%22 fill=%22%23b3c2d4%22/%3E%3Ccircle cx=%22782%22 cy=%22510%22 r=%2252%22 fill=%22%23b3c2d4%22/%3E%3Crect x=%22410%22 y=%22345%22 width=%22380%22 height=%2280%22 rx=%2212%22 fill=%22%23d7e0ea%22/%3E%3C/svg%3E';

function normalizeCity(city: string | null | undefined): City {
  if (city === 'montreal' || city === 'toronto' || city === 'ottawa' || city === 'vancouver') {
    return city;
  }
  return 'montreal';
}

function vehicleCategory(powertrain: PublicVehicle['powertrain']): string {
  if (powertrain === 'ELECTRIC') return 'Electric vehicle';
  if (powertrain === 'HYBRID') return 'Hybrid vehicle';
  return 'Plug-in hybrid vehicle';
}

export function mapPublicVehicle(vehicle: PublicVehicle): Vehicle {
  const sortedPhotos = [...vehicle.photos].sort((left, right) => left.sortOrder - right.sortOrder);
  const gallery = sortedPhotos.map((photo) => photoUrl(photo)).filter(Boolean) as string[];
  const imageUrl = gallery[0] ?? FALLBACK_IMAGE;
  const weekly = Math.max(1, Math.round(vehicle.weeklyRateCents / 100));
  const daily = Math.max(1, Math.round(weekly / 7));

  return {
    id: vehicle.id,
    brand: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    category: vehicleCategory(vehicle.powertrain),
    powertrain: vehicle.powertrain === 'ELECTRIC' ? 'electric' : 'hybrid',
    rangeKm: vehicle.rangeKm ?? 0,
    seats: vehicle.seats ?? 0,
    transmission: 'automatic',
    trunkLitres: 0,
    chargeKw: 0,
    city: normalizeCity(vehicle.city),
    useCases: ['driver', 'individual'],
    status: vehicle.status === 'AVAILABLE' ? 'available' : 'reserved',
    imageUrl,
    gallery: gallery.length > 0 ? gallery : [imageUrl],
    pricing: {
      currency: 'CAD',
      daily,
      weekly,
      monthly: Math.max(weekly * 4, weekly),
      deposit: 0,
    },
    odometerKm: 0,
    plate: '',
    vin: '',
    nextMaintenance: '',
    condition: 'good',
    highlights: vehicle.description ? [vehicle.description] : [],
  };
}

export function mapPublicVehicles(publicVehicles: PublicVehicle[]): Vehicle[] {
  return publicVehicles.map(mapPublicVehicle);
}

export async function listPublicVehicles(params: {
  page?: number;
  limit?: number;
  powertrain?: PublicVehicle['powertrain'];
  maxWeeklyRateCents?: number;
} = {}): Promise<PublicVehicleListResponse> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.powertrain !== undefined) query.set('powertrain', params.powertrain);
  if (params.maxWeeklyRateCents !== undefined) {
    query.set('maxWeeklyRateCents', String(params.maxWeeklyRateCents));
  }
  const path = query.toString() ? `/vehicles?${query.toString()}` : '/vehicles';
  return apiRequest<PublicVehicleListResponse>(path, {});
}

export async function getPublicVehicle(id: string): Promise<PublicVehicle> {
  return apiRequest<PublicVehicle>(`/vehicles/${id}`, {});
}

import { apiRequest } from './api';

export type ContactSubject = 'driver' | 'individual' | 'support' | 'partner' | 'other';

export interface CreateContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  subject: ContactSubject;
  message: string;
}

export interface ContactMessageRecord {
  emailDelivered: boolean;
}

export async function createContactMessage(
  payload: CreateContactMessageInput,
): Promise<ContactMessageRecord> {
  return apiRequest<ContactMessageRecord>('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

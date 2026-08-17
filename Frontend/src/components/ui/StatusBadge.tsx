import React from 'react';
import {
  AlertTriangleIcon,
  BanIcon,
  CheckCircle2Icon,
  ClockIcon,
  CircleDotIcon,
  FileCheckIcon,
  HourglassIcon,
  KeyRoundIcon,
  RefreshCcwIcon,
  WrenchIcon,
  XCircleIcon } from
'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { Badge } from './Badge';
import type { BadgeTone } from './Badge';

export type StatusKind =
'vehicle' |
'file' |
'doc' |
'invoice' |
'deposit' |
'booking' |
'rental' |
'maintenance' |
'incident' |
'contract' |
'severity';

const namespaces: Record<StatusKind, string> = {
  vehicle: 'badge',
  file: 'fileStatus',
  doc: 'docStatus',
  invoice: 'invoiceStatus',
  deposit: 'depositStatus',
  booking: 'bookingStatus',
  rental: 'rentalStage',
  maintenance: 'maintenanceStatus',
  incident: 'incidentStatus',
  contract: 'contractStatus',
  severity: 'severity'
};

const tones: Record<string, BadgeTone> = {
  available: 'success',
  soon: 'info',
  reserved: 'info',
  rented: 'accent',
  maintenance: 'warn',
  unavailable: 'neutral',
  incomplete: 'warn',
  review: 'info',
  approved: 'success',
  actionRequired: 'danger',
  required: 'neutral',
  submitted: 'info',
  rejected: 'danger',
  expiring: 'warn',
  paid: 'success',
  upcoming: 'info',
  late: 'warn',
  failed: 'danger',
  refunded: 'neutral',
  held: 'info',
  released: 'success',
  draft: 'neutral',
  pending: 'warn',
  confirmed: 'success',
  active: 'accent',
  completed: 'neutral',
  cancelled: 'neutral',
  contract: 'info',
  ready: 'info',
  returnDue: 'warn',
  planned: 'info',
  inProgress: 'warn',
  done: 'success',
  open: 'warn',
  assigned: 'info',
  resolved: 'success',
  toSign: 'warn',
  signed: 'success',
  expired: 'neutral',
  low: 'neutral',
  medium: 'warn',
  high: 'danger'
};

const icons: Record<string, React.ReactNode> = {
  available: <CheckCircle2Icon className="h-3.5 w-3.5" />,
  soon: <ClockIcon className="h-3.5 w-3.5" />,
  reserved: <CircleDotIcon className="h-3.5 w-3.5" />,
  rented: <KeyRoundIcon className="h-3.5 w-3.5" />,
  maintenance: <WrenchIcon className="h-3.5 w-3.5" />,
  unavailable: <BanIcon className="h-3.5 w-3.5" />,
  incomplete: <AlertTriangleIcon className="h-3.5 w-3.5" />,
  review: <HourglassIcon className="h-3.5 w-3.5" />,
  approved: <CheckCircle2Icon className="h-3.5 w-3.5" />,
  actionRequired: <AlertTriangleIcon className="h-3.5 w-3.5" />,
  submitted: <FileCheckIcon className="h-3.5 w-3.5" />,
  rejected: <XCircleIcon className="h-3.5 w-3.5" />,
  expiring: <ClockIcon className="h-3.5 w-3.5" />,
  paid: <CheckCircle2Icon className="h-3.5 w-3.5" />,
  upcoming: <ClockIcon className="h-3.5 w-3.5" />,
  late: <AlertTriangleIcon className="h-3.5 w-3.5" />,
  failed: <XCircleIcon className="h-3.5 w-3.5" />,
  refunded: <RefreshCcwIcon className="h-3.5 w-3.5" />,
  toSign: <AlertTriangleIcon className="h-3.5 w-3.5" />,
  signed: <CheckCircle2Icon className="h-3.5 w-3.5" />
};

interface StatusBadgeProps {
  kind: StatusKind;
  value: string;
  size?: 'sm' | 'md';
  className?: string;
}

/** Status is always label + icon, never colour alone. */
export function StatusBadge({ kind, value, size = 'sm', className }: StatusBadgeProps) {
  const { t } = useI18n();
  return (
    <Badge tone={tones[value] ?? 'neutral'} icon={icons[value]} size={size} className={className}>
      {t(`${namespaces[kind]}.${value}`)}
    </Badge>);

}
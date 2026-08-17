import {
  AlertTriangleIcon,
  BadgeDollarSignIcon,
  BanknoteIcon,
  BookOpenIcon,
  Building2Icon,
  CalendarDaysIcon,
  CarFrontIcon,
  ClipboardListIcon,
  CreditCardIcon,
  FileSignatureIcon,
  FileTextIcon,
  FolderOpenIcon,
  GaugeIcon,
  HelpCircleIcon,
  KeyRoundIcon,
  LifeBuoyIcon,
  MessageSquareIcon,
  ReceiptIcon,
  SettingsIcon,
  TrendingUpIcon,
  UsersIcon,
  WrenchIcon
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SubNavItem {
  labelKey: string;
  descKey?: string;
  to: string;
  icon?: LucideIcon;
}

export interface PublicNavItem {
  labelKey: string;
  to?: string;
  end?: boolean;
  children?: SubNavItem[];
}

export interface NavItem {
  labelKey: string;
  to: string;
  icon?: LucideIcon;
  end?: boolean;
}

export const publicNav: PublicNavItem[] = [
  {
    labelKey: 'nav.vehicles',
    to: '/vehicules'
  },
  {
    labelKey: 'nav.solutions',
    children: [
      {
        labelKey: 'nav.drivers',
        descKey: 'nav.sub.driversDesc',
        to: '/chauffeurs',
        icon: CarFrontIcon
      },
      {
        labelKey: 'nav.individuals',
        descKey: 'nav.sub.individualsDesc',
        to: '/particuliers',
        icon: UsersIcon
      },
      {
        labelKey: 'nav.fleet',
        descKey: 'nav.sub.fleetDesc',
        to: '/flotte',
        icon: Building2Icon
      }
    ]
  },
  {
    labelKey: 'nav.resources',
    children: [
      {
        labelKey: 'nav.howItWorks',
        descKey: 'nav.sub.howItWorksDesc',
        to: '/comment-ca-marche',
        icon: HelpCircleIcon
      },
      {
        labelKey: 'nav.pricing',
        descKey: 'nav.sub.pricingDesc',
        to: '/tarifs',
        icon: BadgeDollarSignIcon
      },
      {
        labelKey: 'nav.blog',
        descKey: 'nav.sub.blogDesc',
        to: '/blogue',
        icon: BookOpenIcon
      },
      {
        labelKey: 'nav.faq',
        descKey: 'nav.sub.faqDesc',
        to: '/faq',
        icon: MessageSquareIcon
      }
    ]
  },
  {
    labelKey: 'nav.contact',
    to: '/contact'
  }
];

export const footerExplore: NavItem[] = [
  { labelKey: 'nav.vehicles', to: '/vehicules' },
  { labelKey: 'nav.howItWorks', to: '/comment-ca-marche' },
  { labelKey: 'nav.pricing', to: '/tarifs' },
  { labelKey: 'nav.faq', to: '/faq' },
  { labelKey: 'nav.about', to: '/a-propos' }
];

export const footerProfiles: NavItem[] = [
  { labelKey: 'nav.drivers', to: '/chauffeurs' },
  { labelKey: 'nav.individuals', to: '/particuliers' },
  { labelKey: 'nav.portal', to: '/portail' },
  { labelKey: 'nav.admin', to: '/admin' },
  { labelKey: 'nav.signIn', to: '/connexion' }
];

export const footerLegal: NavItem[] = [
  { labelKey: 'footer.terms', to: '/legal/conditions' },
  { labelKey: 'footer.privacy', to: '/legal/confidentialite' },
  { labelKey: 'footer.cookies', to: '/legal/cookies' }
];

export const portalNav: NavItem[] = [
  { labelKey: 'portal.nav.overview', to: '/portail', icon: GaugeIcon, end: true },
  { labelKey: 'portal.nav.bookings', to: '/portail/reservations', icon: ClipboardListIcon },
  { labelKey: 'portal.nav.rental', to: '/portail/location', icon: KeyRoundIcon },
  { labelKey: 'portal.nav.documents', to: '/portail/documents', icon: FolderOpenIcon },
  { labelKey: 'portal.nav.contract', to: '/portail/contrat', icon: FileSignatureIcon },
  { labelKey: 'portal.nav.payments', to: '/portail/paiements', icon: CreditCardIcon },
  { labelKey: 'portal.nav.incident', to: '/portail/incident', icon: AlertTriangleIcon },
  { labelKey: 'portal.nav.support', to: '/portail/support', icon: LifeBuoyIcon },
  { labelKey: 'portal.nav.profile', to: '/portail/profil', icon: SettingsIcon }
];

export const adminNav: NavItem[] = [
  { labelKey: 'admin.nav.dashboard', to: '/admin', icon: GaugeIcon, end: true },
  { labelKey: 'admin.nav.customers', to: '/admin/clients', icon: UsersIcon },
  { labelKey: 'admin.nav.applications', to: '/admin/dossiers', icon: FolderOpenIcon },
  { labelKey: 'admin.nav.vehicles', to: '/admin/vehicules', icon: CarFrontIcon },
  { labelKey: 'admin.nav.calendar', to: '/admin/calendrier', icon: CalendarDaysIcon },
  { labelKey: 'admin.nav.bookings', to: '/admin/reservations', icon: ClipboardListIcon },
  { labelKey: 'admin.nav.rentals', to: '/admin/locations', icon: KeyRoundIcon },
  { labelKey: 'admin.nav.contracts', to: '/admin/contrats', icon: FileTextIcon },
  { labelKey: 'admin.nav.payments', to: '/admin/paiements', icon: ReceiptIcon },
  { labelKey: 'admin.nav.deposits', to: '/admin/depots', icon: BanknoteIcon },
  { labelKey: 'admin.nav.maintenance', to: '/admin/maintenance', icon: WrenchIcon },
  { labelKey: 'admin.nav.incidents', to: '/admin/incidents', icon: AlertTriangleIcon },
  { labelKey: 'admin.nav.reports', to: '/admin/rapports', icon: TrendingUpIcon },
  { labelKey: 'admin.nav.settings', to: '/admin/parametres', icon: SettingsIcon }
];
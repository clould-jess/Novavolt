import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, MenuIcon, PhoneIcon, XIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { publicNav } from '../../data/navigation';
import type { PublicNavItem } from '../../data/navigation';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Logo } from '../ui/Logo';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Navbar() {
  const { t } = useI18n();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Active dropdown state for desktop hover/click
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Active accordion state for mobile
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const transparent = isHome && !scrolled;
  const tone = transparent ? 'light' : 'dark';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-200 ease-signature',
        transparent
          ? 'border-b border-transparent bg-transparent'
          : 'border-b border-line bg-white/85 shadow-nav backdrop-blur-md'
      )}
    >
      <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-6 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
        <Logo tone={tone} />

        {/* Desktop Navigation */}
        <nav aria-label={t('common.menu')} className="hidden items-center gap-2 lg:flex">
          {publicNav.map((item: PublicNavItem) => {
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isOpen = activeDropdown === item.labelKey;

            // Check if any child route is active
            const isChildActive = item.children?.some((child) => location.pathname === child.to);
            const isDirectActive = item.to ? location.pathname === item.to : false;
            const isActive = isChildActive || isDirectActive;

            if (!hasChildren && item.to) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive: linkActive }) =>
                    cn(
                      'rounded-full px-4 py-2 text-2xs font-semibold transition-colors duration-200 ease-signature',
                      transparent
                        ? 'text-white/90 hover:bg-white/10 hover:text-white'
                        : 'text-ink/80 hover:bg-slate-100 hover:text-ink',
                      linkActive && (transparent ? 'bg-white/15 text-white' : 'bg-slate-100 text-action font-bold')
                    )
                  }
                >
                  {t(item.labelKey)}
                </NavLink>
              );
            }

            return (
              <div
                key={item.labelKey}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.labelKey)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() => setActiveDropdown(isOpen ? null : item.labelKey)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-2xs font-semibold transition-colors duration-200 ease-signature',
                    transparent
                      ? 'text-white/90 hover:bg-white/10 hover:text-white'
                      : 'text-ink/80 hover:bg-slate-100 hover:text-ink',
                    (isOpen || isActive) &&
                      (transparent ? 'bg-white/15 text-white' : 'bg-slate-100 text-action font-bold')
                  )}
                  aria-expanded={isOpen}
                >
                  <span>{t(item.labelKey)}</span>
                  <ChevronDownIcon
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>

                {/* Dropdown Popover */}
                <AnimatePresence>
                  {isOpen && item.children && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                      className="absolute left-0 top-full pt-2"
                    >
                      <div className="w-80 overflow-hidden rounded-2xl border border-line bg-white/95 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-black/5">
                        <div className="flex flex-col gap-1">
                          {item.children.map((child) => {
                            const Icon = child.icon;
                            const isSubActive = location.pathname === child.to;

                            return (
                              <Link
                                key={child.to}
                                to={child.to}
                                onClick={() => setActiveDropdown(null)}
                                className={cn(
                                  'group flex items-start gap-3.5 rounded-xl p-3 transition-colors duration-150',
                                  isSubActive ? 'bg-sky-50/80' : 'hover:bg-slate-50'
                                )}
                              >
                                {Icon && (
                                  <span
                                    className={cn(
                                      'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors',
                                      isSubActive
                                        ? 'bg-action text-white'
                                        : 'bg-slate-100 text-slate-600 group-hover:bg-sky-100 group-hover:text-action'
                                    )}
                                  >
                                    <Icon className="h-4.5 w-4.5" />
                                  </span>
                                )}
                                <div>
                                  <p
                                    className={cn(
                                      'text-2xs font-semibold transition-colors',
                                      isSubActive ? 'text-action font-bold' : 'text-ink group-hover:text-action'
                                    )}
                                  >
                                    {t(child.labelKey)}
                                  </p>
                                  {child.descKey && (
                                    <p className="mt-0.5 text-[0.7rem] leading-snug text-muted">
                                      {t(child.descKey)}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher tone={tone} />
          <a
            href={`tel:${t('common.phone').replace(/[^\d+]/g, '')}`}
            className={cn(
              'nv-link hidden items-center gap-1.5 text-2xs font-semibold xl:inline-flex',
              transparent ? 'text-white/90 hover:text-white' : 'text-ink/75 hover:text-ink'
            )}
          >
            <PhoneIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {t('common.phone')}
          </a>
          <Button to="/vehicules" size="sm" variant={transparent ? 'inverse' : 'primary'}>
            {t('common.bookVehicle')}
          </Button>
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher tone={tone} />
          <IconButton
            label={open ? t('common.closeMenu') : t('common.openMenu')}
            icon={open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            onClick={() => setOpen((value) => !value)}
            className={transparent ? 'text-white hover:bg-white/10 hover:text-white' : undefined}
            aria-expanded={open}
          />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-white lg:hidden"
          >
            <nav aria-label={t('common.menu')} className="mx-auto max-w-content px-4 py-4 sm:px-6">
              <ul className="flex flex-col divide-y divide-line">
                {publicNav.map((item: PublicNavItem) => {
                  const hasChildren = Boolean(item.children && item.children.length > 0);
                  const isExpanded = expandedMobile === item.labelKey;

                  if (!hasChildren && item.to) {
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            cn(
                              'block py-3 text-sm font-semibold transition-colors duration-150',
                              isActive ? 'text-action font-bold' : 'text-ink hover:text-action'
                            )
                          }
                        >
                          {t(item.labelKey)}
                        </NavLink>
                      </li>
                    );
                  }

                  return (
                    <li key={item.labelKey} className="py-2">
                      <button
                        type="button"
                        onClick={() => setExpandedMobile(isExpanded ? null : item.labelKey)}
                        className="flex w-full items-center justify-between py-1.5 text-sm font-semibold text-ink"
                      >
                        <span>{t(item.labelKey)}</span>
                        <ChevronDownIcon
                          className={cn(
                            'h-4 w-4 text-muted transition-transform duration-200',
                            isExpanded && 'rotate-180 text-action'
                          )}
                        />
                      </button>

                      <AnimatePresence>
                        {isExpanded && item.children && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-1 space-y-1 overflow-hidden pl-3"
                          >
                            {item.children.map((child) => {
                              const Icon = child.icon;

                              return (
                                <li key={child.to}>
                                  <Link
                                    to={child.to}
                                    className="flex items-center gap-2.5 rounded-lg py-2.5 text-2xs font-semibold text-slate-700 hover:text-action"
                                  >
                                    {Icon && <Icon className="h-4 w-4 text-action" />}
                                    <span>{t(child.labelKey)}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5">
                <Button to="/vehicules" fullWidth>
                  {t('common.bookVehicle')}
                </Button>
                <a
                  href={`tel:${t('common.phone').replace(/[^\d+]/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 py-2 text-2xs font-semibold text-action"
                >
                  <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                  {t('common.phone')}
                </a>
                <Link to="/connexion" className="text-center text-2xs font-semibold text-muted hover:text-ink">
                  {t('nav.signIn')}
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
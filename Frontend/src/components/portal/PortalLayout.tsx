import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LogOutIcon, MenuIcon, PhoneIcon, XIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { currentCustomer, customerName } from '../../data/customers';
import { portalNav } from '../../data/navigation';
import { initials } from '../../utils/format';
import { cn } from '../../utils/cn';
import { IconButton } from '../ui/IconButton';
import { Logo } from '../ui/Logo';
import { StatusBadge } from '../ui/StatusBadge';
import { LanguageSwitcher } from '../marketing/LanguageSwitcher';

export function PortalLayout() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  const nav =
  <nav aria-label={t('portal.label')} className="flex flex-col gap-1">
      {portalNav.map((item) =>
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
      cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-2xs font-semibold transition-colors duration-200 ease-signature',
        isActive ? 'bg-action text-white' : 'text-muted hover:bg-surface hover:text-ink'
      )
      }>
      
          {item.icon && <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
          {t(item.labelKey)}
        </NavLink>
    )}
    </nav>;


  return (
    <div className="flex min-h-screen w-full bg-soft">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-white p-4 lg:flex">
        <Logo />
        <p className="mt-6 px-3 text-[0.75rem] font-semibold uppercase tracking-wide text-muted">
          {t('portal.label')}
        </p>
        <div className="mt-3 flex-1">{nav}</div>
        <div className="border-t border-line pt-4">
          <div className="flex items-center gap-3 px-1">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-2xs font-bold text-white"
              aria-hidden="true">
              
              {initials(currentCustomer.firstName, currentCustomer.lastName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-2xs font-semibold text-ink">{customerName(currentCustomer)}</p>
              <p className="truncate text-[0.75rem] text-muted">{t(`useCase.${currentCustomer.profile}`)}</p>
            </div>
          </div>
          <NavLink
            to="/connexion"
            className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-2xs font-semibold text-muted transition-colors duration-200 hover:bg-surface hover:text-ink">
            
            <LogOutIcon className="h-4 w-4" aria-hidden="true" />
            {t('common.signOut')}
          </NavLink>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <IconButton
                label={open ? t('common.closeMenu') : t('common.openMenu')}
                icon={open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open} />
              
              <Logo compact />
            </div>
            <div className="hidden lg:block">
              <StatusBadge kind="file" value={currentCustomer.fileStatus} size="md" />
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${t('common.phone').replace(/[^\d+]/g, '')}`}
                className="nv-link hidden items-center gap-1.5 text-2xs font-semibold text-muted hover:text-ink sm:inline-flex">
                
                <PhoneIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {t('common.phone')}
              </a>
              <LanguageSwitcher />
            </div>
          </div>
          {open &&
          <div className="border-t border-line bg-white p-4 lg:hidden">
              {nav}
              <StatusBadge kind="file" value={currentCustomer.fileStatus} className="mt-4" />
            </div>
          }
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>);

}
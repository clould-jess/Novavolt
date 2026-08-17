import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BellIcon, LogOutIcon, MenuIcon, SearchIcon, XIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { adminNav } from '../../data/navigation';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';
import { IconButton } from '../ui/IconButton';
import { Logo } from '../ui/Logo';
import { LanguageSwitcher } from '../marketing/LanguageSwitcher';

export function AdminLayout() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  const nav =
  <nav aria-label={t('admin.label')} className="flex flex-col gap-0.5">
      {adminNav.map((item) =>
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
      cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] font-semibold transition-colors duration-200 ease-signature',
        isActive ? 'bg-white/10 text-white' : 'text-sky-100/65 hover:bg-white/5 hover:text-white'
      )
      }>
      
          {item.icon && <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
          {t(item.labelKey)}
        </NavLink>
    )}
    </nav>;


  return (
    <div className="flex min-h-screen w-full bg-soft">
      {/* Dense, dark operational sidebar to separate admin from the public site */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-ink p-3 lg:flex">
        <div className="px-2 py-2">
          <Logo tone="light" />
        </div>
        <p className="mt-4 px-3 text-[0.75rem] font-semibold uppercase tracking-wide text-sky-100/40">
          {t('admin.label')}
        </p>
        <div className="mt-2 flex-1">{nav}</div>
        <NavLink
          to="/connexion"
          className="mt-3 flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] font-semibold text-sky-100/65 transition-colors duration-200 hover:bg-white/5 hover:text-white">
          
          <LogOutIcon className="h-4 w-4" aria-hidden="true" />
          {t('common.signOut')}
        </NavLink>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <IconButton
                  label={open ? t('common.closeMenu') : t('common.openMenu')}
                  icon={open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
                  onClick={() => setOpen((value) => !value)}
                  aria-expanded={open} />
                
              </div>
              <div className="relative hidden sm:block">
                <label htmlFor="admin-search" className="sr-only">
                  {t('common.search')}
                </label>
                <SearchIcon
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  aria-hidden="true" />
                
                <input
                  id="admin-search"
                  type="search"
                  placeholder={t('common.search')}
                  className="h-9 w-56 rounded-lg border border-line bg-white pl-9 pr-3 text-2xs text-body placeholder:text-muted/70 focus:border-action focus:outline-none focus:ring-4 focus:ring-action/10" />
                
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="relative">
                <IconButton label={t('portal.notifications')} icon={<BellIcon className="h-5 w-5" />} />
                <Badge tone="danger" className="absolute -right-1 -top-1 px-1.5 py-0">
                  2
                </Badge>
              </span>
              <LanguageSwitcher />
              <span
                className="grid h-9 w-9 place-items-center rounded-full bg-ink text-2xs font-bold text-white"
                aria-hidden="true">
                
                LT
              </span>
            </div>
          </div>
          {open && <div className="border-t border-line bg-ink p-3 lg:hidden">{nav}</div>}
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <div className="mx-auto max-w-[82rem]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>);

}
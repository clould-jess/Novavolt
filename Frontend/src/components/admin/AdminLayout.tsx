import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BellIcon, LogOutIcon, MenuIcon, SearchIcon, ShieldCheckIcon, XIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { adminNav } from '../../data/navigation';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Logo } from '../ui/Logo';
import { Modal } from '../ui/Modal';
import { LanguageSwitcher } from '../marketing/LanguageSwitcher';
import { logout as signOut } from '../../services/auth';
import { listAdminNotifications } from '../../services/adminNotifications';

export function AdminLayout() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    void listAdminNotifications().then((response) => setUnreadCount(response.unread)).catch(() => setUnreadCount(0));
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/connexion', { replace: true });
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  const renderNav = (onNavigate?: () => void) => (
    <nav aria-label={t('admin.label')} className="flex flex-col gap-0.5">
      {adminNav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-base font-semibold transition-colors duration-200 ease-signature',
              isActive ? 'bg-white/10 text-white' : 'text-sky-100/65 hover:bg-white/5 hover:text-white',
            )
          }
        >
          {item.icon && <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
          {t(item.labelKey)}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="nv-admin-surface flex min-h-screen w-full bg-soft">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-ink p-3 lg:flex">
        <div className="px-2 py-2">
          <Logo variant="footer" />
        </div>
        <p className="mt-4 px-3 text-sm font-semibold uppercase tracking-wide text-sky-100/40">
          {t('admin.label')}
        </p>
        <div className="mt-2 flex-1">{renderNav()}</div>
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="mt-3 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-base font-semibold text-sky-100/65 transition-colors duration-200 hover:bg-white/5 hover:text-white"
        >
          <LogOutIcon className="h-4 w-4" aria-hidden="true" />
          {t('common.signOut')}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <IconButton
                  label={open ? t('common.closeMenu') : t('common.openMenu')}
                  icon={open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
                  onClick={() => setOpen((value) => !value)}
                  aria-expanded={open}
                />
              </div>
              <div className="relative hidden sm:block">
                <label htmlFor="admin-search" className="sr-only">
                  {t('common.search')}
                </label>
                <SearchIcon
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <input
                  id="admin-search"
                  type="search"
                  placeholder={t('common.search')}
                  className="h-9 w-56 rounded-lg border border-line bg-white pl-9 pr-3 text-2xs text-body placeholder:text-muted/70 focus:border-action focus:outline-none focus:ring-4 focus:ring-action/10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="relative inline-flex">
                <IconButton label={t('portal.notifications')} icon={<BellIcon className="h-5 w-5" />} onClick={() => navigate('/admin/notifications')} />
                {unreadCount > 0 ? <Badge tone="danger" className="absolute -right-1 -top-1 px-1.5 py-0">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge> : null}
              </span>
              <IconButton label="Security Activity" icon={<ShieldCheckIcon className="h-5 w-5" />} onClick={() => navigate('/admin/security')} />
              <LanguageSwitcher />
              <IconButton
                label={t('common.signOut')}
                icon={<LogOutIcon className="h-5 w-5" />}
                onClick={() => setLogoutOpen(true)}
                className="lg:hidden"
              />
              <span
                className="grid h-9 w-9 place-items-center rounded-full bg-ink text-2xs font-bold text-white"
                aria-hidden="true"
              >
                LT
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <div className="mx-auto max-w-[82rem]">
            <Outlet />
          </div>
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t('common.closeMenu')}
            className="absolute inset-0 bg-ink/45"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[86vw] max-w-sm flex-col overflow-y-auto border-r border-white/10 bg-ink p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <Logo variant="footer" />
              <IconButton
                label={t('common.closeMenu')}
                icon={<XIcon className="h-5 w-5" />}
                onClick={() => setOpen(false)}
              />
            </div>
            <p className="mt-4 px-1 text-sm font-semibold uppercase tracking-wide text-sky-100/40">
              {t('admin.label')}
            </p>
            <div className="mt-3 flex-1">{renderNav(() => setOpen(false))}</div>
            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                iconLeft={<LogOutIcon className="h-4 w-4" />}
                onClick={() => {
                  setOpen(false);
                  setLogoutOpen(true);
                }}
              >
                {t('common.signOut')}
              </Button>
            </div>
          </aside>
        </div>
      )}

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title={t('common.logoutConfirm')}
        description={t('common.logoutBody')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setLogoutOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleLogout} loading={loggingOut}>
              {t('common.signOut')}
            </Button>
          </>
        }
      />
    </div>
  );
}

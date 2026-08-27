import React from 'react';
import { useLocation } from 'react-router-dom';
import { LayersIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { adminNav } from '../../data/navigation';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeading } from '../../components/ui/PageHeading';

/** Placeholder for admin sections whose screens are not designed yet. */
export function AdminComingSoon() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const item = adminNav.find((entry) => entry.to === pathname);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title={item ? t(item.labelKey) : t('admin.label')}
        description={t('admin.comingSoonBody')}
      />
      <EmptyState
        icon={<LayersIcon className="h-5 w-5" />}
        title={t('admin.comingSoonTitle')}
        body={t('admin.comingSoonBody')}
        action={<Button to="/admin">{t('admin.nav.dashboard')}</Button>}
      />
    </div>
  );

}

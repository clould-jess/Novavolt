import React from 'react';
import { LayersIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeading } from '../../components/ui/PageHeading';

export function AdminDashboard() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title={t('admin.nav.dashboard')}
        description={t('admin.comingSoonBody')}
      />
      <EmptyState
        icon={<LayersIcon className="h-5 w-5" />}
        title={t('admin.comingSoonTitle')}
        body={t('admin.comingSoonBody')}
        action={<Button to="/admin/vehicules">{t('admin.fleet.addVehicle')}</Button>}
      />
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { ArrowRightIcon, CarFrontIcon, KeyRoundIcon, ReceiptIcon, WrenchIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import {
  mockDashboardKPIs,
  paymentStatusSeries,
  revenueSeries,
  urgentActions,
  utilisationSeries } from
'../../data/dashboard';
import { KpiCard } from '../../components/admin/KpiCard';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader } from '../../components/ui/Card';
import { PageHeading } from '../../components/ui/PageHeading';

const toneClass = {
  warn: 'warn',
  bad: 'danger',
  info: 'info'
} as const;

export function AdminDashboard() {
  const { t, money, num } = useI18n();
  const kpis = mockDashboardKPIs;

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title={t('admin.nav.dashboard')} description={t('admin.reports.subtitle')} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          emphasis
          label={t('admin.kpi.revenueWeek')}
          value={money(kpis.revenueWeek)}
          hint={`${t('admin.kpi.revenueMonth')} · ${money(kpis.revenueMonth)}`}
          icon={<ReceiptIcon className="h-4 w-4" />}
          tone="accent" />
        
        <KpiCard
          label={t('admin.kpi.utilisation')}
          value={`${kpis.utilisationRate} %`}
          hint={`${num(kpis.vehiclesRented)} ${t('admin.kpi.rented').toLowerCase()}`}
          icon={<KeyRoundIcon className="h-4 w-4" />} />
        
        <KpiCard
          label={t('admin.kpi.available')}
          value={num(kpis.vehiclesAvailable)}
          icon={<CarFrontIcon className="h-4 w-4" />} />
        
        <KpiCard
          label={t('admin.kpi.maintenance')}
          value={num(kpis.vehiclesMaintenance)}
          icon={<WrenchIcon className="h-4 w-4" />}
          tone="warn" />
        
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={t('admin.kpi.rented')} value={num(kpis.vehiclesRented)} />
        <KpiCard label={t('admin.kpi.revenueMonth')} value={money(kpis.revenueMonth)} />
        <KpiCard label={t('admin.kpi.paymentsUpcoming')} value={num(kpis.paymentsUpcoming)} />
        <KpiCard label={t('admin.kpi.paymentsFailed')} value={num(kpis.paymentsFailed)} tone="danger" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card padding="md">
          <CardHeader title={t('admin.charts.revenue')} description={t('admin.reports.p90')} />
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(value: number) => money(value)} />
                
                <Bar dataKey="revenue" fill="#0284C7" radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padding="md">
          <CardHeader title={t('admin.charts.utilisation')} />
          <div className="mt-5 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilisationSeries} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} domain={[40, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(value: number) => `${value} %`} />
                
                <Area type="monotone" dataKey="utilisation" stroke="#38BDF8" fill="#E0F2FE" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-muted">
              {t('admin.charts.payments')}
            </p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {paymentStatusSeries.map((entry) =>
              <li key={entry.key} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-[0.75rem] text-muted">{t(`invoiceStatus.${entry.key}`)}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-pill bg-surface">
                    <span
                    className="block h-full rounded-pill bg-action"
                    style={{ width: `${entry.value}%` }}
                    aria-hidden="true" />
                  
                  </span>
                  <span className="w-9 shrink-0 text-right text-[0.75rem] font-semibold text-ink">{entry.value}%</span>
                </li>
              )}
            </ul>
          </div>
        </Card>
      </div>

      <Card padding="md">
        <CardHeader title={t('admin.urgent.title')} />
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {urgentActions.map((action) =>
          <li key={action.id}>
              <Link
              to={action.to}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 transition-[border-color,background-color] duration-200 ease-signature hover:border-action hover:bg-soft">
              
                <span className="flex items-center gap-2.5">
                  <Badge tone={toneClass[action.tone]}>{action.count}</Badge>
                  <span className="text-2xs font-semibold text-ink">{t(action.labelKey)}</span>
                </span>
                <span className="flex items-center gap-1 text-[0.75rem] font-semibold text-action">
                  {t('admin.urgent.open')}
                  <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          )}
        </ul>
      </Card>
    </div>);

}
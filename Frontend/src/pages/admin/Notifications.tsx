import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArchiveIcon, BellIcon, Building2Icon, CarFrontIcon, MailIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { CenteredLoading } from '../../components/ui/CenteredLoading';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeading } from '../../components/ui/PageHeading';
import { archiveAdminNotification, listAdminNotifications, markAdminNotificationRead, type AdminNotification } from '../../services/adminNotifications';

const iconFor = { FLEET_REQUEST: Building2Icon, RESERVATION_REQUEST: CarFrontIcon, CONTACT_MESSAGE: MailIcon };
const labelFor = { FLEET_REQUEST: 'Fleet', RESERVATION_REQUEST: 'Réservation', CONTACT_MESSAGE: 'Contact' };

export function AdminNotifications() {
  const { dateLong } = useI18n(); const { showToast } = useToast();
  const [items, setItems] = useState<AdminNotification[]>([]); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); try { setItems((await listAdminNotifications()).items); } catch { showToast({ tone: 'error', title: 'Impossible de charger les notifications.' }); } finally { setLoading(false); } }, [showToast]);
  useEffect(() => { void load(); }, [load]);
  const unread = useMemo(() => items.filter((item) => !item.readAt).length, [items]);
  const markRead = async (item: AdminNotification) => { if (item.readAt) return; setBusy(item.id); try { await markAdminNotificationRead(item.id); setItems((current) => current.map((row) => row.id === item.id ? { ...row, readAt: new Date().toISOString() } : row)); } finally { setBusy(null); } };
  const archive = async (id: string) => { setBusy(id); try { await archiveAdminNotification(id); setItems((current) => current.filter((item) => item.id !== id)); } catch { showToast({ tone: 'error', title: 'Archivage impossible.' }); } finally { setBusy(null); } };
  if (loading) return <CenteredLoading className="min-h-[28rem]" />;
  return <div className="flex flex-col gap-6"><PageHeading title="Notifications" description={`${unread} non lue${unread === 1 ? '' : 's'}`} action={<Button variant="secondary" onClick={() => void load()}>Rafraîchir</Button>} />
    {items.length === 0 ? <EmptyState icon={<BellIcon className="h-6 w-6" />} title="Aucune notification" body="Les nouvelles demandes apparaîtront ici." /> : <div className="grid gap-3">{items.map((item) => { const Icon = iconFor[item.type]; return <Card key={item.id} padding="md" className={item.readAt ? 'opacity-70' : 'border-action/40 bg-action/[0.03]'}><CardHeader title={<div className="flex items-center gap-2"><Icon className="h-4 w-4 text-action" /><span>{item.title}</span>{!item.readAt && <Badge tone="info">Nouveau</Badge>}</div>} description={item.preview} action={<span className="text-2xs text-muted">{dateLong(item.createdAt)}</span>} /><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="secondary" loading={busy === item.id} onClick={() => void markRead(item)} disabled={Boolean(item.readAt)}>Marquer comme lu</Button><Button size="sm" variant="secondary" iconLeft={<ArchiveIcon className="h-4 w-4" />} loading={busy === item.id} onClick={() => void archive(item.id)}>Archiver</Button><Badge tone="neutral">{labelFor[item.type]}</Badge></div></Card>; })}</div>}</div>;
}

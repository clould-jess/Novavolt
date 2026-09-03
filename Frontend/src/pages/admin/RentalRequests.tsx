import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2Icon, MailIcon, PhoneIcon, RefreshCcwIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { deleteRentalRequest, listRentalRequests, type RentalRequest } from '../../services/rentalRequests';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { CenteredLoading } from '../../components/ui/CenteredLoading';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageHeading } from '../../components/ui/PageHeading';

export function AdminRentalRequests() {
  const { showToast } = useToast();
  const [items, setItems] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [target, setTarget] = useState<RentalRequest | null>(null);
  const [deleting, setDeleting] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { setItems(await listRentalRequests()); } catch { showToast({ tone: 'error', title: 'Impossible de charger les demandes de location.' }); } finally { setLoading(false); } }, [showToast]);
  useEffect(() => { void load(); }, [load]);
  const visible = useMemo(() => { const q = search.trim().toLowerCase(); return !q ? items : items.filter((item) => Object.values(item).join(' ').toLowerCase().includes(q)); }, [items, search]);
  const remove = async () => { if (!target || deleting) return; setDeleting(true); try { await deleteRentalRequest(target.id); setItems((current) => current.filter((item) => item.id !== target.id)); setTarget(null); showToast({ tone: 'success', title: 'Demande supprimée avec succès.' }); } catch { showToast({ tone: 'error', title: 'Une erreur est survenue. Veuillez réessayer.' }); } finally { setDeleting(false); } };
  if (loading) return <div className="flex flex-col gap-6"><PageHeading title="Demandes de location" description="Les prospects qui souhaitent être contactés." /><CenteredLoading className="min-h-[28rem]" /></div>;
  return <div className="flex flex-col gap-6"><PageHeading title="Demandes de location" description="Les prospects qui souhaitent être contactés." action={<Button variant="secondary" onClick={() => void load()} iconLeft={<RefreshCcwIcon className="h-4 w-4" />}>Actualiser</Button>} /><Card><Input id="rental-requests-search" label="Rechercher" value={search} onChange={(event) => setSearch(event.target.value)} iconLeft={<SearchIcon className="h-4 w-4" />} /></Card>{visible.length === 0 ? <EmptyState icon={<Building2Icon className="h-6 w-6" />} title="Aucune demande de location" body="Les nouvelles demandes apparaîtront ici." /> : <div className="grid gap-4 xl:grid-cols-2">{visible.map((item) => <Card key={item.id}><CardHeader title={`${item.firstName} ${item.lastName}`} description={new Date(item.createdAt).toLocaleString('fr-CA')} /><dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-2xs font-semibold uppercase text-muted">Téléphone</dt><dd className="mt-1 text-ink">{item.phone}</dd></div><div><dt className="text-2xs font-semibold uppercase text-muted">E-mail</dt><dd className="mt-1 break-all text-ink">{item.email}</dd></div><div><dt className="text-2xs font-semibold uppercase text-muted">Ville</dt><dd className="mt-1 text-ink">{item.city}</dd></div></dl><div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4"><Button href={`mailto:${item.email}`} variant="secondary" size="sm" iconLeft={<MailIcon className="h-4 w-4" />}>E-mail</Button><Button href={`tel:${item.phone.replace(/[^\d+]/g, '')}`} variant="secondary" size="sm" iconLeft={<PhoneIcon className="h-4 w-4" />}>Appeler</Button><Button variant="danger" size="sm" iconLeft={<Trash2Icon className="h-4 w-4" />} onClick={() => setTarget(item)}>Supprimer</Button></div></Card>)}</div>}<Modal open={Boolean(target)} onClose={() => !deleting && setTarget(null)} title="Supprimer cette demande ?" description="Cette action est irréversible. Voulez-vous vraiment supprimer cette demande ?" footer={<><Button variant="secondary" disabled={deleting} onClick={() => setTarget(null)}>Annuler</Button><Button variant="danger" loading={deleting} onClick={() => void remove()}>Supprimer</Button></>}><p className="rounded-xl bg-soft p-3 text-sm text-body">{target?.firstName} {target?.lastName} · {target?.email}</p></Modal></div>;
}

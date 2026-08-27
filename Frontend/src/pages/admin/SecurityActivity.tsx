import { useCallback, useEffect, useState } from 'react';
import { ChromeIcon, LaptopIcon, LogOutIcon, MonitorSmartphoneIcon, ShieldCheckIcon } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { CenteredLoading } from '../../components/ui/CenteredLoading';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeading } from '../../components/ui/PageHeading';
import { listActiveSessions, revokeActiveSession, type ActiveSession } from '../../services/sessions';

function deviceLabel(userAgent: string | null) { const ua = userAgent ?? ''; const mobile = /Android|iPhone|iPad|Mobile/i.test(ua); const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : 'Browser'; const os = /Windows/i.test(ua) ? 'Windows' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad|Mac OS/i.test(ua) ? 'Apple' : mobile ? 'Mobile' : 'Desktop'; return `${os} · ${browser}`; }
function activityLabel(date: string, current: boolean) { if (current) return 'Active now'; const minutes = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 60000)); return minutes < 60 ? `Last active ${minutes} min ago` : minutes < 1440 ? `Last active ${Math.floor(minutes / 60)} h ago` : `Last active ${Math.floor(minutes / 1440)} d ago`; }

export function SecurityActivity() {
  const { showToast } = useToast(); const [sessions, setSessions] = useState<ActiveSession[]>([]); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); try { setSessions(await listActiveSessions()); } catch { showToast({ tone: 'error', title: 'Unable to load security activity.' }); } finally { setLoading(false); } }, [showToast]);
  useEffect(() => { void load(); }, [load]);
  const revoke = async (id: string) => { setBusy(id); try { await revokeActiveSession(id); setSessions((all) => all.filter((session) => session.id !== id)); showToast({ tone: 'success', title: 'Session logged out.' }); } catch { showToast({ tone: 'error', title: 'Unable to log out this session.' }); } finally { setBusy(null); } };
  if (loading) return <CenteredLoading className="min-h-[28rem]" />;
  const current = sessions.find((session) => session.current); const others = sessions.filter((session) => !session.current);
  const sessionCard = (session: ActiveSession) => <Card key={session.id} padding="md"><CardHeader title={<div className="flex items-center gap-2"><MonitorSmartphoneIcon className="h-4 w-4 text-action" />{deviceLabel(session.userAgent)}</div>} description={session.ipAddress || 'Location unavailable'} action={<span className="text-2xs font-semibold text-ok">{activityLabel(session.lastUsedAt, session.current)}</span>} /><div className="mt-4 flex items-center justify-between gap-3 text-2xs text-muted"><span>Started {new Date(session.createdAt).toLocaleString()}</span>{!session.current ? <Button size="sm" variant="secondary" iconLeft={<LogOutIcon className="h-4 w-4" />} loading={busy === session.id} onClick={() => void revoke(session.id)}>Logout</Button> : null}</div></Card>;
  return <div className="flex flex-col gap-6"><PageHeading title="Security Activity" description="Review active login sessions and sign out other devices." action={<Button variant="secondary" onClick={() => void load()}>Refresh</Button>} />
    <section><div className="mb-3 flex items-center gap-2"><ShieldCheckIcon className="h-5 w-5 text-action" /><h2 className="font-display text-lg font-semibold text-ink">Current session</h2></div>{current ? sessionCard(current) : <EmptyState icon={<LaptopIcon className="h-5 w-5" />} title="No current session found" body="Refresh this page to check again." />}</section>
    <section><div className="mb-3 flex items-center gap-2"><ChromeIcon className="h-5 w-5 text-action" /><h2 className="font-display text-lg font-semibold text-ink">Other sessions</h2></div>{others.length ? <div className="grid gap-3">{others.map(sessionCard)}</div> : <EmptyState icon={<MonitorSmartphoneIcon className="h-5 w-5" />} title="No other active sessions" body="Your account is signed in on this device only." />}</section></div>;
}

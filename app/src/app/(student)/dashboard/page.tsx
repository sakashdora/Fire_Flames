import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { getSessionUser } from '@/lib/supabase/server';
import ProfileForm from '@/components/workspace/ProfileForm';
import { Notice } from '@/components/ui/Notice';

export const metadata = { title: 'My workspace | Fire & Flames 2026' };
export const dynamic = 'force-dynamic';

const STATE_LABEL: Record<string, string> = {
  draft: 'Draft', awaiting_members: 'Inviting team', payment_due: 'Place held · payment pending', payment_review: 'Payment under review',
  confirmed: 'Confirmed', expired: 'Expired', cancelled: 'Cancelled', waitlisted: 'Waitlisted', action_required: 'Action required',
};

const STAFF_LINKS: Record<string, { href: string; label: string }> = {
  super_admin: { href: '/admin', label: 'Admin console' }, event_admin: { href: '/admin', label: 'Admin console' },
  referee: { href: '/referee', label: 'Referee console' }, volunteer: { href: '/volunteer', label: 'Volunteer desk' }, judge: { href: '/judge', label: 'Judge workspace' },
};

export default async function DashboardPage() {
  const { supabase, user } = await getSessionUser();
  if (!supabase) return <div className="ws"><Notice>The workspace is unavailable because Supabase is not connected to this deployment.</Notice></div>;
  if (!user) redirect('/student-login?next=/dashboard');

  const { data: ws, error } = await supabase.rpc('ff_my_workspace');
  if (error || !ws) return <div className="ws"><Notice tone="error">We could not load your workspace. Refresh to try again.</Notice></div>;

  const staff = Array.from(new Map((ws.roles as any[]).filter(r => STAFF_LINKS[r.role]).map(r => [STAFF_LINKS[r.role].href, STAFF_LINKS[r.role]])).values());

  return <div className="ws">
    <div className="ws-head">
      <span className="badge-gold">MY WORKSPACE</span>
      <h1>{ws.profile ? `Hello, ${ws.profile.display_name.split(' ')[0]}` : 'Complete your profile'}</h1>
      <p>{ws.profile ? 'Your registrations, team invitations and assigned duties.' : 'Add your details once. Organizers use them for registrations, passes and results.'}</p>
    </div>

    {!ws.profile ? <div className="ws-card"><ProfileForm profile={null} email={ws.email} /></div> : <div className="ws-grid">
      <div className="stack">
        {ws.pending_invitations.length > 0 && <div className="ws-card">
          <h2>Team invitations</h2>
          <ul className="ws-list">{ws.pending_invitations.map((i: any) => <li key={i.id}>
            <span><strong>{i.team_name}</strong> · {i.event_name}<br /><span className="meta">Open the link your captain shared with you to accept.</span></span>
          </li>)}</ul>
        </div>}

        <div className="ws-card">
          <h2>My registrations</h2>
          {ws.registrations.length === 0 ? <p style={{ color: 'var(--text-muted)', marginBottom: 14 }}>You have not started a registration yet.</p>
            : <ul className="ws-list" style={{ marginBottom: 16 }}>{ws.registrations.map((r: any) => <li key={r.id}>
              <span><strong>{r.team_name ?? r.event_name}</strong><br /><span className="meta">{r.event_name} · {r.reference}{r.is_owner ? ' · Captain' : ''}</span></span>
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className={r.state === 'confirmed' ? 'badge-verified' : 'badge-gold'}>{STATE_LABEL[r.state] ?? r.state}</span>
                <Link className="btn-secondary btn-small" href={`/registrations/${r.id}`}>Open</Link>
              </span>
            </li>)}</ul>}
          <Link href="/register" className="btn-primary">Register for an event <ArrowRight size={16} /></Link>
        </div>

        {staff.length > 0 && <div className="ws-card">
          <h2>Staff duties</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
            {ws.aal === 'aal2' ? <><ShieldCheck size={14} style={{ verticalAlign: -2 }} /> Two-step verification confirmed for this session.</>
              : <>Staff actions need two-step verification. <Link href="/mfa" style={{ color: 'var(--gold-400)' }}>Verify now</Link>.</>}
          </p>
          <div className="row">{staff.map(s => <Link key={s.href} className="btn-secondary btn-small" href={s.href}>{s.label}</Link>)}</div>
        </div>}
      </div>

      <div className="ws-card">
        <h2>Profile</h2>
        <ProfileForm profile={ws.profile} email={ws.email} />
        <form action="/auth/signout" method="post" style={{ marginTop: 18 }}><button className="btn-secondary btn-small">Sign out</button></form>
      </div>
    </div>}
  </div>;
}

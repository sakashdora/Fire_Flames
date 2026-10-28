import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/supabase/server';
import AcceptInvitation from '@/components/workspace/AcceptInvitation';
import { Notice } from '@/components/ui/Notice';

export const metadata = { title: 'Team invitation | Fire & Flames 2026', referrer: 'no-referrer' };
export const dynamic = 'force-dynamic';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { supabase, user } = await getSessionUser();
  if (!supabase) return <div className="ws ws-narrow"><Notice>Invitations are unavailable because Supabase is not connected.</Notice></div>;
  if (!user) redirect(`/student-login?next=/invite/${token}`);

  const { data: profile } = await supabase.rpc('ff_my_workspace');
  const { data, error } = await supabase.rpc('ff_invitation_preview', { p_token: token });

  return <div className="ws ws-narrow">
    <div className="ws-head"><span className="badge-gold">TEAM INVITATION</span><h1>{data ? `Join ${data.team_name}` : 'Invitation'}</h1></div>
    <div className="ws-card stack">
      {error || !data ? <Notice tone="error">This invitation link is not valid.</Notice>
        : data.status !== 'pending' ? <Notice tone="error">This invitation is {data.status}. Ask your captain for a new link.</Notice>
        : !data.for_this_account ? <Notice tone="error">This invitation was sent to a different email address. Sign in with that email to accept it.</Notice>
        : !profile?.profile ? <Notice>Before joining, <Link href="/dashboard">complete your profile</Link>, then open this link again.</Notice>
        : <>
          <p style={{ color: 'var(--text-muted)' }}><strong>{data.captain}</strong> invited you to join <strong>{data.team_name}</strong> for <strong>{data.event_name}</strong>.</p>
          <AcceptInvitation token={token} />
        </>}
    </div>
  </div>;
}

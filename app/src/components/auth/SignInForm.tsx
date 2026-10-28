'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Notice } from '@/components/ui/Notice';

const safeNext = (value: string | null) => (value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard');

/** Passwordless email sign-in through Supabase Auth. */
export default function SignInForm({ audience }: { audience: 'student' | 'teacher' }) {
  const params = useSearchParams();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(params.get('error') === 'link' ? 'That sign-in link is invalid or has expired. Request a new one.' : null);

  if (!supabase) {
    return <Notice tone="info">Sign-in is not available on this deployment yet because the Supabase project is not connected. No email will be sent.</Notice>;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    setMessage(null);
    const redirect = new URL('/auth/callback', window.location.origin);
    redirect.searchParams.set('next', safeNext(params.get('next')));
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirect.toString(), shouldCreateUser: true } });
    if (error) {
      setState('error');
      setMessage(error.status === 429 ? 'Too many sign-in emails were requested. Wait a few minutes and try again.' : 'We could not send the sign-in email. Check the address and try again.');
      return;
    }
    setState('sent');
  };

  if (state === 'sent') {
    return <Notice tone="ok">We sent a sign-in link to <strong>{email}</strong>. Open it on this device to continue. The link expires in one hour.</Notice>;
  }

  return <form onSubmit={submit} className="stack">
    {message && <Notice tone="error">{message}</Notice>}
    <label className="field">{audience === 'teacher' ? 'College email' : 'College or personal email'}
      <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
    </label>
    <button type="submit" className="btn-primary" disabled={state === 'sending'}>
      {state === 'sending' ? 'Sending link…' : 'Email me a sign-in link'} <ArrowRight size={16} />
    </button>
  </form>;
}

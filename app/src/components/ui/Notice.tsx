import Link from 'next/link';
import type { ApiResult } from '@/lib/client/api';

export function Notice({ tone = 'info', children }: { tone?: 'ok' | 'error' | 'info'; children: React.ReactNode }) {
  return <div className={`notice notice-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</div>;
}

/** Renders an API failure with the next step a person can take. */
export function ApiErrorNotice({ result }: { result: ApiResult | null }) {
  if (!result || result.ok || !result.error) return null;
  const { code, message } = result.error;
  return <Notice tone="error">
    {message}
    {code === 'mfa_required' && <> <Link href="/mfa">Set up or confirm two-step verification</Link>.</>}
    {code === 'profile_required' && <> <Link href="/dashboard">Complete your profile</Link>.</>}
    {code === 'unauthenticated' && <> <Link href="/student-login">Sign in again</Link>.</>}
  </Notice>;
}

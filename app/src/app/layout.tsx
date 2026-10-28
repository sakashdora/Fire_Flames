import type { Metadata } from 'next';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { getSessionUser } from '@/lib/supabase/server';
import './globals.css';
import './workspace.css';

export const metadata: Metadata = {
  title: 'Fire & Flames 2026 | Srusti Academy of Management & Technology',
  description: 'Fire & Flames E-Fest by ED Cell and Kurukshetra Esports by Srustiprosar. Explore the events at Srusti Academy, Bhubaneswar.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSessionUser();
  return <html lang="en"><body>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <SiteHeader signedIn={!!user} />
    <main id="main-content" tabIndex={-1}>{children}</main>
    <SiteFooter signedIn={!!user} />
  </body></html>;
}

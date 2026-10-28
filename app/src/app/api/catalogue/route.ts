import { runCommand } from '@/lib/api/command';

// Live registration state (open/closed, approved fees, places held) from the database.
export async function GET(request: Request) {
  const track = new URL(request.url).searchParams.get('track');
  return runCommand('ff_public_catalogue', { p_track: track === 'e-fest' || track === 'esports' ? track : null }, { anonymous: true });
}

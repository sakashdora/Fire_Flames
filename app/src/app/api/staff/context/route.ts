import { jsonError, runCommand } from '@/lib/api/command';

export async function GET(request: Request) {
  const event = new URL(request.url).searchParams.get('event');
  if (!event) return jsonError(422, 'invalid', 'Choose an event.');
  return runCommand('ff_staff_context', { p_event_slug: event });
}

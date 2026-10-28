import { jsonError, num, readJson, runCommand, str } from '@/lib/api/command';

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await readJson(request);
  if (!body) return jsonError(422, 'invalid', 'Send the change as JSON.');
  switch (body.action) {
    case 'configure':
      return runCommand('ff_admin_configure_event', {
        p_event_slug: slug, p_capacity: num(body.capacity), p_team_min: num(body.team_min), p_team_max: num(body.team_max),
        p_prices: body.prices ?? {}, p_reason: str(body.reason),
      });
    case 'publish':
      return runCommand('ff_admin_publish_event', { p_event_slug: slug, p_public_description: str(body.public_description), p_rules_text: str(body.rules_text) });
    case 'registration':
      return runCommand('ff_admin_set_registration', { p_event_slug: slug, p_enabled: body.enabled === true, p_closes_at: str(body.closes_at) || null });
    default:
      return jsonError(422, 'invalid', 'Unknown action.');
  }
}

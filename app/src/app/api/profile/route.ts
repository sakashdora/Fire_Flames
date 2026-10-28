import { jsonError, num, readJson, runCommand, str } from '@/lib/api/command';

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return jsonError(422, 'invalid', 'Send the profile as JSON.');
  const input = {
    display_name: str(body.display_name), phone: str(body.phone), college: str(body.college), course: str(body.course),
    year_of_study: str(body.year_of_study), affiliation: str(body.affiliation) ?? 'student',
    publicity_consent: body.publicity_consent === true, privacy_version: body.privacy_accepted === true ? 'privacy-2026-v1' : null,
  };
  return runCommand('ff_save_profile', { p_input: input, p_expected_version: num(body.expected_version) });
}

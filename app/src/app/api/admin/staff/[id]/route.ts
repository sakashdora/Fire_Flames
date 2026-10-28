import { readJson, runCommand, str } from '@/lib/api/command';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await readJson(request);
  return runCommand('ff_admin_revoke_role', { p_assignment_id: id, p_reason: str(body?.reason) });
}

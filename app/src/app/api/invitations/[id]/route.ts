import { runCommand } from '@/lib/api/command';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return runCommand('ff_revoke_invitation', { p_invitation_id: id });
}

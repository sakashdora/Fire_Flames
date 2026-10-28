import { runCommand } from '@/lib/api/command';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return runCommand('ff_registration_detail', { p_registration_id: id });
}

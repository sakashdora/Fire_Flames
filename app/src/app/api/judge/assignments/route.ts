import { runCommand } from '@/lib/api/command';

export async function GET() {
  return runCommand('ff_judge_assignments');
}

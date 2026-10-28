import RegistrationManager from '@/components/workspace/RegistrationManager';

export const metadata = { title: 'Manage registration | Fire & Flames 2026' };

export default async function RegistrationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div className="ws"><RegistrationManager id={id} /></div>;
}

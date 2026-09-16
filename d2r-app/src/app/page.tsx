import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

export default async function HomePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role === 'admin' || user.role === 'manager') redirect('/admin/dashboard');
  if (user.role === 'client') redirect('/admin/merchandising');
  redirect('/merchandising');
}

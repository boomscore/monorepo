'use client';

import { Button } from './ui';
import { logout } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

export const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Logout request failed (likely expired session):', error);
    } finally {
      router.refresh();
      router.push('/');
    }
  };

  return (
    <Button variant="secondary" onClick={handleLogout}>
      Logout
    </Button>
  );
};

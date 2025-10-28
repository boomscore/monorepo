'use client';

import { Button } from './ui';
import { logout } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

export const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.refresh(); // Refresh server components to show logged out state
      router.push('/'); // Redirect to home
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Button variant="secondary" onClick={handleLogout}>
      Logout
    </Button>
  );
};

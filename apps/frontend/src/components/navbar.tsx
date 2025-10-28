import Image from 'next/image';
import React from 'react';
import { Button } from './ui';
import Link from 'next/link';
import { getServerCurrentUser } from '@/lib/auth/server';
import { LogoutButton } from './logout-button';

export const Navbar = async () => {
  const me = await getServerCurrentUser();
  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-4">
      <Image src="/logo.svg" alt="logo" width={100} height={100} />
      <div className="flex items-center gap-4">
        <Button asChild>
          <Link href="/fixtures">Fixtures</Link>
        </Button>
        {me?.user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm">{me.user.email}</span>
            <LogoutButton />
          </div>
        ) : (
          <Button asChild>
            <Link href="/account">Sign in</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

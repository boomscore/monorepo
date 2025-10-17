import Image from 'next/image';
import React from 'react';
import { Button } from './ui';
import Link from 'next/link';

export const Navbar = () => {
  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-4">
      <Image src="/logo.svg" alt="logo" width={100} height={100} />
      <div className="flex items-center gap-4">
        <Button size="lg" className=" bg-[#EAFAF4] text-[#2bbb82]" asChild>
          <Link href="/fixtures">Fixtures</Link>
        </Button>
      </div>
    </div>
  );
};

'use client';

import { useMobile } from '@/lib/utils';

export default function Home() {
  const isMobile = useMobile();
  return (
    <main>
      <div>
         {isMobile ? (
          <p className="flex items-center justify-center min-h-screen">Mobile View</p>
        ) : (
          <p className="flex items-center justify-center min-h-screen">Desktop View</p>
        )}
      </div>
    </main>
  );
}

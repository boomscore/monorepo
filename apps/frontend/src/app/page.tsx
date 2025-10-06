'use client';

import { useMobile } from '@/lib/utils';

export default function Home() {
  const isMobile = useMobile();
  return (
    <main>
      <div>{isMobile ? <p>Mobile View</p> : <p>Desktop View</p>}</div>
    </main>
  );
}

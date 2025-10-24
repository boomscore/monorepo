import { Skeleton } from '@/components';
import { FixturesContent } from './components/fixtures-content';
import { Suspense } from 'react';

export default function FixturesPage() {
  return (
    <div className="flex-1 gap-6 flex flex-col">
      <Suspense
        fallback={
          <div className="p-4">
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          </div>
        }
      >
        <FixturesContent />
      </Suspense>
    </div>
  );
}

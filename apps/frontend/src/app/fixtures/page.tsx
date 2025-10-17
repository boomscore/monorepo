import { FixtureGames, SportsTypeTabs } from './components';
import { FixturesList } from './components/fixtures-list';
import { Skeleton } from '@/components';
import { FixturesContent } from './components/fixtures-content';
import { Suspense } from 'react';

export default function FixturesPage() {
  return (
    <div className="flex-1 p-4 max-w-4xl mx-auto bg-app-background gap-6 flex flex-col">
      {/* <div className="mb-6">
        <div className="border-y-1 border-grey-300 py-4">
          <SportsTypeTabs />
        </div>
        <div>
          <FixtureGames today={today} />
        </div>
      </div> */}
      {/* <FixturesList initialDate={today} /> */}
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

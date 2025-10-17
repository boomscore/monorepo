'use client';

import React from 'react';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger} from '@/components/ui';
import { SportType } from '@/constants';


const sportsTypeData = [
  { name: SportType.FOOTBALL, slug: 'football' },
  { name: SportType.BASKETBALL, slug: 'basketball' },
  { name: SportType.TENNIS, slug: 'tennis' },
  { name: SportType.BASEBALL, slug: 'baseball' },
  { name: SportType.VOLLEYBALL, slug: 'volleyball' },
];

export const SportsTypeTabs = () => {
  const defaultSport = sportsTypeData[0].slug;
 
  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <Tabs defaultValue={defaultSport}>
        <TabsList variant="default" shape="pill" size="lg" className="inline-flex w-auto">
          {sportsTypeData.map(({ name, slug }) => (
            <TabsTrigger key={slug} value={slug} asChild>
              <Link
                href={`/fixtures/${slug}`}
                scroll={false}
                className="inline-flex items-center gap-2 whitespace-nowrap"
              >
                {name}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

'use client';

import React, { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SportType, SPORT_CONFIGS } from '@/types/sport';

export const FixtureSportTypeTabs = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSport = (searchParams.get('sport') as SportType) || SportType.FOOTBALL;

  useEffect(() => {
    const sportParam = searchParams.get('sport');
    if (!sportParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('sport', SportType.FOOTBALL);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, router, pathname]);

  const handleSportChange = (sport: SportType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sport', sport);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <Tabs defaultValue={currentSport}>
        <TabsList variant="default" shape="pill" size="sm" className="inline-flex w-auto">
          {Object.entries(SPORT_CONFIGS).map(([sportKey, config]) => {
            const sport = sportKey as SportType;
            const isDisabled = !config.isActive;

            return (
              <TabsTrigger
                key={sport}
                value={sport}
                disabled={isDisabled}
                onClick={() => !isDisabled && handleSportChange(sport)}
              >
                {config.name}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
};

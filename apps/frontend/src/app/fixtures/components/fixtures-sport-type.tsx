'use client';

import { Badge, Button } from '@/components';
import React, { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SportType, SPORT_CONFIGS } from '@/types/sport';

export const FixtureSportType = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentSport = (searchParams.get('sport') as SportType) || SportType.FOOTBALL;

  useEffect(() => {
    const sportParam = searchParams.get('sport');
    if (!sportParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('sport', SportType.FOOTBALL);
      const newUrl = `${pathname}?${params.toString()}`;
      router.replace(newUrl);
    }
  }, [searchParams, router, pathname]);

  const handleSportChange = (sport: SportType) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set('sport', sport);

    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl);
  };

  return (
    <div className="flex gap-2 items-center">
      {Object.entries(SPORT_CONFIGS).map(([sportKey, config]) => {
        const sport = sportKey as SportType;
        const isActive = currentSport === sport;
        const isDisabled = !config.isActive;

        if (isActive) {
          return (
            <Button key={sport} variant="primary" size="sm" disabled={isDisabled}>
              {config.name}
            </Button>
          );
        }

        return (
          <Button
            key={sport}
            variant={isDisabled ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => !isDisabled && handleSportChange(sport)}
          >
            {config.name}
          </Button>
        );
      })}
    </div>
  );
};

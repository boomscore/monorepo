'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FixturesList } from './fixtures-list';
import { Separator, Skeleton, Input, Button } from '@/components';
import { X } from 'lucide-react';

import { FixtureGames } from './fixture-game';
import { FixtureSportTypeTabs } from './fixtures-sport-type-tab';

export const FixturesContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const dateParam = searchParams.get('date');
    const today = new Date().toISOString().split('T')[0];
    const initialDate = dateParam || today;
    setSelectedDate(initialDate);
  }, [searchParams]);

  const updateDateInUrl = (date: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const today = new Date().toISOString().split('T')[0];

    if (date === today) {
      params.delete('date');
    } else {
      params.set('date', date);
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);

    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }

    const newDateString = newDate.toISOString().split('T')[0];
    setSelectedDate(newDateString);
    updateDateInUrl(newDateString);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    updateDateInUrl(date);
  };

  if (!selectedDate) {
    return (
      <div className="p-4">
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 ">
      <div className="p-2 px-4">
        {showSearch && (
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for games..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setShowSearch(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="p-2 px-4">
        <FixtureSportTypeTabs />
      </div>
      <Separator />

      <div className="p-2 px-4 space-y-4">
        <FixtureGames
          today={selectedDate}
          navigateDate={navigateDate}
          onDateChange={handleDateChange}
          onToggleSearch={() => setShowSearch(!showSearch)}
        />
      </div>

      <Separator />

      <div className="p-4">
        <FixturesList
          key={selectedDate}
          initialDate={selectedDate}
          initialIsToday={selectedDate === new Date().toISOString().split('T')[0]}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};

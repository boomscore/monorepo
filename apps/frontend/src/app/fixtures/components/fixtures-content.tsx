'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FixturesList } from './fixtures-list';
import { Button, Separator, Skeleton } from '@/components';
import { FixtureSportType } from './fixtures-sport-type';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';

export const FixturesContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedDate, setSelectedDate] = useState<string>('');

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

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateOnly = dateString;
    const todayString = today.toISOString().split('T')[0];
    const yesterdayString = yesterday.toISOString().split('T')[0];
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    if (dateOnly === todayString) return 'Today';
    if (dateOnly === yesterdayString) return 'Yesterday';
    if (dateOnly === tomorrowString) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
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
    <div className="flex-1 max-w-4xl mx-auto bg-bg-app">
      <div className="p-4">
        <FixtureSportType />
      </div>
      <Separator />
      <div className="p-4 flex gap-4 justify-between items-center">
        <h1 className="text-3xl font-bold mb-2">Fixtures</h1>

        <div className="flex items-center gap-4">
          <Button onClick={() => navigateDate('prev')} variant="ghost">
            <ArrowLeftIcon />
          </Button>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={e => handleDateChange(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 font-medium">
              {formatDisplayDate(selectedDate)}
            </span>
          </div>

          <Button onClick={() => navigateDate('next')} variant="ghost">
            <ArrowRightIcon />
          </Button>
        </div>


        
      </div>
      <Separator />

      <div className="p-4">
        <FixturesList
          key={selectedDate}
          initialDate={selectedDate}
          initialIsToday={selectedDate === new Date().toISOString().split('T')[0]}
        />
      </div>
    </div>
  );
};

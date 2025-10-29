'use client';

import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useMobile } from '@/lib/utils';


type FixtureGamesProps = {
  today: string;
  navigateDate: (direction: 'prev' | 'next') => void;
  onDateChange?: (date: string) => void;
  onToggleSearch?: () => void;
};

export const FixtureGames = ({
  navigateDate,
  today,
  onDateChange,
  onToggleSearch,
}: FixtureGamesProps) => {
  const [date, setDate] = useState<Date>(new Date(today));
  const isMobile = useMobile();

  useEffect(() => {
    setDate(new Date(today));
  }, [today]);

  const goToday = () => {
    const todayDate = new Date();
    setDate(todayDate);
    onDateChange?.(format(todayDate, 'yyyy-MM-dd'));
  };

  const handleCalendarSelect = (selected: Date | undefined) => {
    if (!selected) return;
    setDate(selected);
    onDateChange?.(format(selected, 'yyyy-MM-dd'));
  };

  return (
    <div className="flex items-center justify-between mt-4">
      <div>
        <h4 className="text-lg font-semibold">Fixtures</h4>
        <div className="mt-2 w-[100px]">
          <Select defaultValue={today} name="fixture-date">
            <SelectTrigger size="sm">
              <SelectValue placeholder="Filter options" className="text-grey-950" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one">All fixtures</SelectItem>
              <SelectItem value="two">Upcoming fixtures</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!isMobile && (
          <div className="flex items-center gap-2 rounded-full p-2 border border-border">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigateDate('prev')}
              className="rounded-full bg-card"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button className="bg-card text-foreground" onClick={goToday}>
                  {date.toDateString() === new Date().toDateString()
                    ? 'Today'
                    : format(date, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar mode="single" selected={date} onSelect={handleCalendarSelect} />
              </PopoverContent>
            </Popover>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigateDate('next')}
              className="rounded-full bg-card"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Button variant="ghost" className="rounded-full bg-card" size="lg" onClick={onToggleSearch}>
          <Search />
        </Button>
      </div>
    </div>
  );
};

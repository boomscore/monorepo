'use client';

import React, { useState } from 'react';
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
import { CalendarIcon, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';

type FixtureGamesProps = {
  today: string;
};

export const FixtureGames = ({ today }: FixtureGamesProps) => {
  const [date, setDate] = useState<Date>(new Date(today));
  const goNextDay = () => setDate(addDays(date, 1));
  const goPrevDay = () => setDate(subDays(date, 1));
  const goToday = () => setDate(new Date());
  return (
    <div className="flex items-center justify-between mt-4">
      <div>
        <h1 className="text-2xl font-semibold ">Fixtures</h1>
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
        <div className="flex items-center gap-2 bg-base-black rounded-full px-3 py-2 shadow-sm border">
          <Button
            // variant="mono"
            size="icon"
            onClick={goPrevDay}
            className="rounded-full bg-grey-500"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Popover Calendar */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="text-gray-700 font-medium bg-grey-500 rounded-full"
                onClick={goToday}
              >
                {date.toDateString() === new Date().toDateString()
                  ? 'Today'
                  : format(date, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar mode="single" selected={date} onSelect={d => d && setDate(d)} />
            </PopoverContent>
          </Popover>

          <Button
            // variant="mono"
            size="icon"
            onClick={goNextDay}
            className="rounded-full bg-grey-500"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Right side: search icon */}
        <Button variant="ghost" size="icon" className="rounded-full bg-grey-500">
          <Search className="h-5 w-5 text-gray-700" />
        </Button>
      </div>
    </div>
  );
};

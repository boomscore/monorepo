'use client';

import React, { useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { Sheet, SheetContent, SheetTitle, Input, Separator, Spinner } from '@/components/ui';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Search, X } from 'lucide-react';
import { FixtureCard } from './fixture-card';
import { NoFixtures } from '@/components';
import Image from 'next/image';
import { FixtureSportTypeTabs } from './fixtures-sport-type-tab';

const SEARCH_FIXTURES = gql`
  query SearchFixtures($query: String!, $date: String, $isLive: Boolean) {
    searchFixtures(query: $query, date: $date, isLive: $isLive) {
      id
      homeTeam {
        name
        logo
        id
      }
      awayTeam {
        id
        name
        logo
      }
      awayScore
      awayPenaltyScore
      awayHalfTimeScore
      awayExtraTimeScore
      finishedAt
      hasStarted
      homeExtraTimeScore
      homeHalfTimeScore
      homePenaltyScore
      homeScore
      isLive
      isFinished
      minute
      status
      startTime
      league {
        id
        name
        displayName
        logo
        country
      }
      timeUntilStart
      result
    }
  }
`;

interface FixturesSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchFixture {
  id: string;
  homeTeam: {
    name: string;
    logo: string;
    id: string;
  };
  awayTeam: {
    id: string;
    name: string;
    logo: string;
  };
  awayScore?: number | null;
  awayPenaltyScore?: number | null;
  awayHalfTimeScore?: number | null;
  awayExtraTimeScore?: number | null;
  finishedAt?: string | null;
  hasStarted: boolean;
  homeExtraTimeScore?: number | null;
  homeHalfTimeScore?: number | null;
  homePenaltyScore?: number | null;
  homeScore?: number | null;
  isLive: boolean;
  isFinished: boolean;
  minute?: number | null;
  status: string;
  startTime: string;
  league: {
    id: string;
    name: string;
    displayName: string;
    logo: string;
    country: string;
  };
  timeUntilStart?: string | null;
  result?: string | null;
}

export const FixturesSearch: React.FC<FixturesSearchProps> = ({ open, onOpenChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchFixture[] | null>(null);
  const [searchFixtures, { loading, error }] = useLazyQuery(SEARCH_FIXTURES, {
    onCompleted: data => {
      setSearchResults(data.searchFixtures || []);
    },
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      searchFixtures({
        variables: {
          query: value.trim(),
        },
      });
    } else {
      setSearchResults(null);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults(null);
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults(null);
    }
    onOpenChange(isOpen);
  };

  const hasResults = searchResults && searchResults.length > 0;
  const showEmptyState =
    searchQuery.trim().length >= 2 && !loading && !hasResults && searchResults !== null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="top"
        className="w-full h-[calc(100vh-64px)] top-16 p-0 border-0 bg-transparent backdrop-blur-sm min-h-screen"
        overlay={false}
        close={false}
      >
        <VisuallyHidden>
          <SheetTitle>Search Fixtures</SheetTitle>
        </VisuallyHidden>
        <div className="flex h-full w-full">
          <div className="max-w-[600px] flex flex-col flex-1 w-full bg-app-background">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm flex flex-col gap-6 px-2">
              <Separator orientation="horizontal" />
              <div>
                <div className="flex items-center gap-3 p-4 w-full">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search for fixtures..."
                      value={searchQuery}
                      onChange={e => handleSearch(e.target.value)}
                      className="pl-10 pr-4 h-12"
                      autoFocus
                    />

                    <button
                      onClick={handleClose}
                      className="p-2 rounded-full hover:bg-accent transition-colors absolute right-4 top-1/2 -translate-y-1/2"
                      aria-label="Close search"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              <Separator orientation="horizontal" />
              <FixtureSportTypeTabs />
              <Separator orientation="horizontal" />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar overflow-x-hidden">
              <div className="px-4 py-6 pb-20">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Spinner className="h-8 w-8" />
                    <p className="text-sm text-muted-foreground mt-4">Searching...</p>
                  </div>
                )}

                {showEmptyState && <NoFixtures searchQuery={searchQuery} />}

                {!loading && searchQuery.trim().length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Image src="/search.svg" alt="Search icon" width={100} height={100} />
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-sm font-medium">Search for fixtures</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Enter at least 2 characters to search
                      </p>
                    </div>
                  </div>
                )}

                {hasResults && (
                  <div className="grid gap-3">
                    {searchResults?.map((match: SearchFixture) => (
                      <FixtureCard key={match.id} match={match as any} showDate />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="w-full h-full hidden lg:flex flex-col flex-1 "></div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

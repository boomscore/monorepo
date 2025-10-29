'use client';

import React, { useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { NoFixtures } from '@/components';
import { Loader2 } from 'lucide-react';
import { FixtureCard } from './fixture-card';

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

interface SearchFixturesProps {
  selectedDate: string;
  searchQuery: string;
}

export const SearchFixtures: React.FC<SearchFixturesProps> = ({ selectedDate, searchQuery }) => {
  const [searchFixtures, { data: searchData, loading: searchLoading }] =
    useLazyQuery(SEARCH_FIXTURES);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchFixtures({
        variables: {
          query: searchQuery.trim(),
          date: selectedDate,
        },
      });
    }
  }, [searchQuery, selectedDate, searchFixtures]);

  const searchResults = searchData?.searchFixtures || [];
  const showResults = searchQuery.trim().length >= 2;

  if (!showResults) {
    return null;
  }

  return (
    <div className="space-y-4">
      {searchLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Searching...</span>
        </div>
      ) : searchResults.length === 0 ? (
        <NoFixtures searchQuery={searchQuery} />
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-text-grey">
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "
            {searchQuery}"
          </p>
          <div className="grid gap-3">
            {searchResults.map((match: any) => (
              <FixtureCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

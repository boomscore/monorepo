'use client';

import React from 'react';
import { gql } from '@apollo/client';
import { FixtureCard } from './fixture-card';
import { Button, NoFixtures, Skeleton } from '@/components';
import { useGroupedFixtures, useInfiniteScroll } from '../hooks';

export const GET_GROUPED_FIXTURES = gql`
  query GetGroupedFixtures(
    $date: String
    $isLive: Boolean
    $isToday: Boolean
    $leagueId: String
    $teamId: String
    $limit: Float
    $offset: Float
  ) {
    matchesGroupedByLeague(
      date: $date
      isLive: $isLive
      isToday: $isToday
      leagueId: $leagueId
      teamId: $teamId
      limit: $limit
      offset: $offset
    ) {
      groups {
        league {
          id
          name
          displayName
          logo
          country
        }
        matches {
          id
          homeTeam {
            name
            logo
            id
          }
          awayTeam {
            name
            logo
            id
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
        totalMatches
        hasLiveMatches
        hasUpcomingMatches
      }
      totalMatches
      totalGroups
      hasMore
    }
  }
`;

interface FixturesListProps {
  initialDate?: string;
  initialIsToday?: boolean;
  searchQuery?: string;
}

export const FixturesList: React.FC<FixturesListProps> = ({
  initialDate,
  initialIsToday = false,
  searchQuery = '',
}) => {
  const effectiveDate = React.useMemo(() => {
    return initialDate ?? new Date().toISOString().split('T')[0];
  }, [initialDate]);

  const { groupedMatches, loading, error, hasMore, loadMore, isLoadingMore, refetch } =
    useGroupedFixtures({
      date: effectiveDate,
      isToday: initialIsToday,
    });

  const { lastElementRef } = useInfiniteScroll({
    loadMore,
    hasMore,
    loading,
    isLoadingMore,
  });

  // Filter matches based on search query
  const filteredGroupedMatches = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedMatches;
    }

    const query = searchQuery.toLowerCase().trim();

    return groupedMatches
      .map(group => {
        const filteredMatches = group.matches.filter(match => {
          const homeTeamName = match.homeTeam.name.toLowerCase();
          const awayTeamName = match.awayTeam.name.toLowerCase();
          const leagueName = (group.league.displayName || group.league.name).toLowerCase();
          const country = group.league.country?.toLowerCase() || '';

          return (
            homeTeamName.includes(query) ||
            awayTeamName.includes(query) ||
            leagueName.includes(query) ||
            country.includes(query)
          );
        });

        return {
          ...group,
          matches: filteredMatches,
        };
      })
      .filter(group => group.matches.length > 0);
  }, [groupedMatches, searchQuery]);

  if (loading && groupedMatches.length === 0) {
    return (
      <div>
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error && groupedMatches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error loading fixtures</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (groupedMatches.length === 0) {
    return (
      <p className="text-center py-8 text-text-grey">No fixtures found for the selected date.</p>
    );
  }

  if (searchQuery.trim() && filteredGroupedMatches.length === 0) {
    return (
      <div >
      <NoFixtures searchQuery={searchQuery} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredGroupedMatches.map(({ league, matches: leagueMatches }, groupIndex) => (
        <div key={league.id} className="space-y-3">
          <div>
            <h3 className="font-medium text-base">{league.displayName || league.name}</h3>
            <p>{league.country}</p>
          </div>

          <div className="grid gap-3">
            {leagueMatches.map((match, matchIndex) => {
              const isLastMatch =
                groupIndex === filteredGroupedMatches.length - 1 &&
                matchIndex === leagueMatches.length - 1;

              return (
                <div
                  key={`${match.id}-${league.id}-${matchIndex}`}
                  ref={isLastMatch ? lastElementRef : null}
                >
                  <FixtureCard match={match} />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {isLoadingMore && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2  mx-auto"></div>
          <p className="text-xs mt-2">Loading more fixtures...</p>
        </div>
      )}
    </div>
  );
};

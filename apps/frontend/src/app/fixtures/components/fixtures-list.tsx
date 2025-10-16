'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { gql, useQuery } from '@apollo/client';
import Image from 'next/image';
import { FixtureCard } from './fixture-card';
import { Match, LeagueGroup } from '../types';

export const GET_FIXTURES = gql`
  query GetFixtures(
    $date: String
    $isLive: Boolean
    $isToday: Boolean
    $leagueId: String
    $teamId: String
    $limit: Float
    $offset: Float
  ) {
    matches(
      date: $date
      isLive: $isLive
      isToday: $isToday
      leagueId: $leagueId
      teamId: $teamId
      limit: $limit
      offset: $offset
    ) {
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
  }
`;

interface FixturesListProps {
  initialDate?: string;
  initialIsToday?: boolean;
}

const MATCHES_PER_PAGE = 20;
const LIVE_POLL_INTERVAL = 30000; 

export const FixturesList: React.FC<FixturesListProps> = ({
  initialDate,
  initialIsToday = false,
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<'active' | 'inactive'>('inactive');
  const observerRef = useRef<IntersectionObserver | null>(null);

  const effectiveDate = React.useMemo(() => {
    return initialDate ?? new Date().toISOString().split('T')[0];
  }, [initialDate]);

  const {
    data: fixturesData,
    loading,
    error,
    fetchMore,
    refetch,
    startPolling,
    stopPolling,
  } = useQuery(GET_FIXTURES, {
    variables: {
      date: effectiveDate,
      isToday: initialIsToday,
      limit: MATCHES_PER_PAGE,
      offset: 0,
    },
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
  });

  useEffect(() => {
    if (fixturesData?.matches) {
      if (offset === 0) {
        setMatches(fixturesData.matches);
      } else {
        setMatches(prev => [...prev, ...fixturesData.matches]);
      }
      setHasMore(fixturesData.matches.length === MATCHES_PER_PAGE);
    }
  }, [fixturesData, offset]);

  const isPollingActive = React.useRef(false);

  useEffect(() => {
    const hasLiveMatches = matches.some(match => match.isLive);
    const hasUpcomingMatches = matches.some(
      match =>
        !match.isFinished &&
        !match.hasStarted &&
        match.startTime &&
        new Date(match.startTime).getTime() - Date.now() < 15 * 60 * 1000, // Starting within 15 minutes
    );

    if (hasLiveMatches || hasUpcomingMatches) {
      if (!isPollingActive.current) {
        startPolling(LIVE_POLL_INTERVAL);
        isPollingActive.current = true;
      }
    } else {
      if (isPollingActive.current) {
        stopPolling();
        isPollingActive.current = false;
      }
    }

    return () => {
      if (isPollingActive.current) {
        stopPolling();
        isPollingActive.current = false;
      }
    };
  }, [matches, startPolling, stopPolling]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const newOffset = offset + MATCHES_PER_PAGE;

    try {
      await fetchMore({
        variables: {
          date: effectiveDate,
          isToday: initialIsToday,
          offset: newOffset,
          limit: MATCHES_PER_PAGE,
        },
      });
      setOffset(newOffset);
    } catch (error) {
      console.error('Error loading more matches:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchMore, offset, hasMore, isLoadingMore, effectiveDate, initialIsToday]);

  // Infinite scroll logic
  const lastMatchElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || isLoadingMore) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, isLoadingMore, hasMore, loadMore],
  );

  const groupedMatches = React.useMemo(() => {
    const groups = new Map<string, LeagueGroup>();

    matches.forEach(match => {
      const leagueId = match.league.id;
      if (!groups.has(leagueId)) {
        groups.set(leagueId, {
          league: match.league,
          matches: [],
        });
      }
      groups.get(leagueId)!.matches.push(match);
    });

    // Sort leagues by name and matches by start time
    return Array.from(groups.values())
      .sort((a, b) =>
        (a.league.displayName || a.league.name).localeCompare(
          b.league.displayName || b.league.name,
        ),
      )
      .map(group => ({
        ...group,
        matches: group.matches.sort((a, b) => {
          if (!a.startTime || !b.startTime) return 0;
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        }),
      }));
  }, [matches]);

  if (loading && matches.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2 w-48"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error && matches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error loading fixtures</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No fixtures found for the selected date.</div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedMatches.map(({ league, matches: leagueMatches }, groupIndex) => (
        <div key={league.id} className="space-y-3">
          <div className="flex items-center gap-3 pb-2">
            <h3 className="font-medium text-base">{league.displayName || league.name}</h3>
          </div>

          <div className="grid gap-3">
            {leagueMatches.map((match, matchIndex) => {
              const isLastMatch =
                groupIndex === groupedMatches.length - 1 && matchIndex === leagueMatches.length - 1;

              return (
                <div key={match.id} ref={isLastMatch ? lastMatchElementRef : null}>
                  <FixtureCard match={match} />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {isLoadingMore && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading more fixtures...</p>
        </div>
      )}

      {!hasMore && matches.length > 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">No more fixtures to load</div>
      )}
    </div>
  );
};

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@apollo/client';
import Image from 'next/image';
import { FixtureCard } from './fixture-card';
import { GET_FIXTURES } from '@/lib/graphql/queries';
import { Match, LeagueGroup } from '../types';

interface FixturesListProps {
  initialDate?: string;
  initialIsToday?: boolean;
}

const MATCHES_PER_PAGE = 20;
const LIVE_POLL_INTERVAL = 30000; // 30 seconds

export const FixturesList: React.FC<FixturesListProps> = ({
  initialDate,
  initialIsToday = false,
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastMatchRef = useRef<HTMLDivElement>(null);

  const effectiveDate = React.useMemo(() => {
    return initialDate ?? new Date().toISOString().split('T')[0];
  }, [initialDate]);

  // Main matches query
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

  // Update matches when data changes
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

  // Start/stop live polling based on whether there are live matches
  useEffect(() => {
    const hasLiveMatches = matches.some(match => match.isLive);

    if (hasLiveMatches) {
      startPolling(LIVE_POLL_INTERVAL);
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [matches, startPolling, stopPolling]);

  // No separate live query; we rely on polling the matches query

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
  }, [fetchMore, offset, hasMore, isLoadingMore]);

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

  // Group matches by league
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
          {/* League Header */}
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
            {league.logo && (
              <div className="w-6 h-6 relative">
                <Image
                  src={league.logo}
                  alt={`${league.name} logo`}
                  width={24}
                  height={24}
                  className="object-contain"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
            )}
            <h3 className="font-semibold text-lg">{league.displayName || league.name}</h3>
            {league.country && <span className="text-sm text-gray-500">({league.country})</span>}
            <span className="text-sm text-gray-400 ml-auto">
              {leagueMatches.length} match{leagueMatches.length !== 1 ? 'es' : ''}
            </span>
          </div>

          {/* League Matches */}
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

      {/* Loading indicator */}
      {isLoadingMore && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading more fixtures...</p>
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && matches.length > 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">No more fixtures to load</div>
      )}
    </div>
  );
};

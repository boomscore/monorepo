import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@apollo/client';
import type { GetGroupedFixturesQuery } from '@/gql/graphql';
import { GET_GROUPED_FIXTURES } from '../components/fixtures-list';

type LeagueGroup = GetGroupedFixturesQuery['matchesGroupedByLeague']['groups'][0];
type Match = LeagueGroup['matches'][0];

interface UseGroupedFixturesProps {
  date?: string;
  isToday?: boolean;
  limit?: number;
}

interface UseGroupedFixturesReturn {
  groupedMatches: LeagueGroup[];
  loading: boolean;
  error: any;
  hasMore: boolean;
  totalLoadedMatches: number;
  loadMore: () => Promise<void>;
  isLoadingMore: boolean;
  refetch: () => void;
}

const MATCHES_PER_PAGE = 20;
const LIVE_POLL_INTERVAL = 30000;

export function useGroupedFixtures({
  date,
  isToday = false,
  limit = MATCHES_PER_PAGE,
}: UseGroupedFixturesProps): UseGroupedFixturesReturn {
  const [groupedMatches, setGroupedMatches] = useState<LeagueGroup[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalLoadedMatches, setTotalLoadedMatches] = useState(0);

  useEffect(() => {
    setGroupedMatches([]);
    setOffset(0);
    setHasMore(true);
    setIsLoadingMore(false);
    setTotalLoadedMatches(0);
  }, [date]);

  const {
    data: fixturesData,
    loading,
    error,
    fetchMore,
    refetch,
    startPolling,
    stopPolling,
  } = useQuery<GetGroupedFixturesQuery>(GET_GROUPED_FIXTURES, {
    variables: {
      date,
      isToday,
      limit,
      offset: 0,
    },
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
  });

  useEffect(() => {
    if (fixturesData?.matchesGroupedByLeague) {
      const groupedData = fixturesData.matchesGroupedByLeague;

      const incomingTotalMatches = groupedData.groups.reduce(
        (sum: number, group: LeagueGroup) => sum + group.matches.length,
        0,
      );

      // If this is a polling update (offset = 0) and we already have more data than what's coming in,
      // merge intelligently to preserve infinite scroll
      if (
        offset === 0 &&
        totalLoadedMatches > incomingTotalMatches &&
        incomingTotalMatches <= MATCHES_PER_PAGE
      ) {
        setGroupedMatches(prev => {
          const mergedGroups = new Map<string, LeagueGroup>();
          prev.forEach(group => {
            mergedGroups.set(group.league.id, group);
          });
          groupedData.groups.forEach((newGroup: LeagueGroup) => {
            const existingGroup = mergedGroups.get(newGroup.league.id);
            if (existingGroup) {
              // Update existing matches with fresh data for status/scores
              const updatedMatches = existingGroup.matches.map(existingMatch => {
                const freshMatch = newGroup.matches.find(m => m.id === existingMatch.id);
                return freshMatch || existingMatch;
              });

              // Add any new matches from polling that weren't in our existing data
              const existingMatchIds = new Set(existingGroup.matches.map(m => m.id));
              const newMatches = newGroup.matches.filter(m => !existingMatchIds.has(m.id));

              mergedGroups.set(newGroup.league.id, {
                ...existingGroup,
                matches: [...updatedMatches, ...newMatches],
                totalMatches: updatedMatches.length + newMatches.length,
                hasLiveMatches: existingGroup.hasLiveMatches || newGroup.hasLiveMatches,
                hasUpcomingMatches: existingGroup.hasUpcomingMatches || newGroup.hasUpcomingMatches,
              });
            } else if (newGroup.matches.length > 0) {
              mergedGroups.set(newGroup.league.id, newGroup);
            }
          });

          const result = Array.from(mergedGroups.values());
          const newTotal = result.reduce((sum, group) => sum + group.matches.length, 0);
          setTotalLoadedMatches(newTotal);
          return result;
        });
      } else {
        setGroupedMatches(groupedData.groups);
        setHasMore(groupedData.hasMore);
        setTotalLoadedMatches(incomingTotalMatches);
      }
    }
  }, [fixturesData, offset, totalLoadedMatches]);

  const isPollingActive = useRef(false);

  useEffect(() => {
    const allMatches = groupedMatches.flatMap(group => group.matches);

    const hasLiveMatches = allMatches.some(match => match.isLive);
    const hasUpcomingMatches = allMatches.some(
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
  }, [groupedMatches, startPolling, stopPolling]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    const newOffset = offset + MATCHES_PER_PAGE;

    try {
      await fetchMore({
        variables: {
          date,
          isToday,
          offset: newOffset,
          limit: MATCHES_PER_PAGE,
        },
        updateQuery: (
          prev: GetGroupedFixturesQuery,
          { fetchMoreResult }: { fetchMoreResult: GetGroupedFixturesQuery },
        ) => {
          if (!fetchMoreResult?.matchesGroupedByLeague) return prev;

          const newGroups = fetchMoreResult.matchesGroupedByLeague.groups;
          const existingGroups = prev.matchesGroupedByLeague?.groups || [];

          const mergedGroups = new Map<string, LeagueGroup>();

          existingGroups.forEach((group: LeagueGroup) => {
            mergedGroups.set(group.league.id, group);
          });

          newGroups.forEach((newGroup: LeagueGroup) => {
            const existingGroup = mergedGroups.get(newGroup.league.id);
            if (existingGroup) {
              const matchIds = new Set(existingGroup.matches.map((m: Match) => m.id));
              const newMatches = newGroup.matches.filter((m: Match) => !matchIds.has(m.id));
              mergedGroups.set(newGroup.league.id, {
                ...existingGroup,
                matches: [...existingGroup.matches, ...newMatches],
                totalMatches: existingGroup.totalMatches + newMatches.length,
                hasLiveMatches: existingGroup.hasLiveMatches || newGroup.hasLiveMatches,
                hasUpcomingMatches: existingGroup.hasUpcomingMatches || newGroup.hasUpcomingMatches,
              });
            } else {
              mergedGroups.set(newGroup.league.id, newGroup);
            }
          });

          const mergedGroupsArray = Array.from(mergedGroups.values());
          const totalMatchesInMergedResult = mergedGroupsArray.reduce(
            (sum: number, group: LeagueGroup) => sum + group.matches.length,
            0,
          );

          return {
            ...prev,
            matchesGroupedByLeague: {
              ...fetchMoreResult.matchesGroupedByLeague,
              groups: mergedGroupsArray,
              totalMatches: totalMatchesInMergedResult,
              totalGroups: mergedGroupsArray.length,
            },
          };
        },
      });

      setOffset(newOffset);
    } catch (error) {
      console.error('Error loading more matches:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchMore, offset, hasMore, isLoadingMore, date, isToday]);

  return {
    groupedMatches,
    loading,
    error,
    hasMore,
    totalLoadedMatches,
    loadMore,
    isLoadingMore,
    refetch,
  };
}

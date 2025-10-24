'use client';

import React, { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, Skeleton } from '@/components';
import Image from 'next/image';

const GET_MATCH_STATISTICS = gql`
  query GetMatchStatistics($matchId: String!) {
    match(id: $matchId) {
      id
      homeTeam {
        id
        name
        logo
      }
      awayTeam {
        id
        name
        logo
      }
      statistics
      status
      isLive
      isFinished
    }
  }
`;

interface MatchStatisticsProps {
  matchId: string;
}

interface StatisticRowProps {
  homeValue: string | number;
  awayValue: string | number;
  label: string;
}

const StatisticRow: React.FC<StatisticRowProps> = ({ homeValue, awayValue, label }) => {
  return (
    <div className="flex items-center justify-between py-2 px-3 border-b border-border last:border-b-0">
      <div className="flex-1 text-end">
        <span className="font-medium text-sm">{homeValue}</span>
      </div>
      <div className="flex-2 text-center">
        <span className="text-text-grey text-xs font-medium">{label}</span>
      </div>
      <div className="flex-1 text-start">
        <span className="font-medium text-sm">{awayValue}</span>
      </div>
    </div>
  );
};

export const MatchStatistics: React.FC<MatchStatisticsProps> = ({ matchId }) => {
  const { data, loading, error, startPolling, stopPolling } = useQuery(GET_MATCH_STATISTICS, {
    variables: { matchId },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (data?.match) {
      const match = data.match;

      if (match.isLive) {
        startPolling(30000);
      } else {
        stopPolling();
      }
    }

    return () => {
      stopPolling();
    };
  }, [data?.match?.isLive, startPolling, stopPolling]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error || !data?.match) {
    return (
      <div className="text-center py-4 text-text-grey">
        <p className="text-sm">No statistics available</p>
      </div>
    );
  }

  const match = data.match;
  const statistics = match.statistics;

  if (!statistics || (!statistics.home && !statistics.away)) {
    return (
      <div className="text-center py-4 text-text-grey">
        <p className="text-sm">No statistics available for this match</p>
      </div>
    );
  }

  const homeStats = statistics.home || {};
  const awayStats = statistics.away || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center justify-end gap-2 flex-1">
          <Image
            src={match.homeTeam.logo}
            alt={match.homeTeam.name}
            width={20}
            height={20}
            className="object-contain"
          />
          <span className="text-sm font-medium truncate">{match.homeTeam.name}</span>
        </div>
        <div className="flex-1" />

        <div className="flex items-center justify-start gap-2 flex-1">
          <span className="text-sm font-medium truncate">{match.awayTeam.name}</span>
          <Image
            src={match.awayTeam.logo}
            alt={match.awayTeam.name}
            width={20}
            height={20}
            className="object-contain"
          />
        </div>
      </div>

      <div>
        {(homeStats.possession !== undefined || awayStats.possession !== undefined) && (
          <StatisticRow
            homeValue={homeStats.possession ? `${homeStats.possession}%` : '-'}
            awayValue={awayStats.possession ? `${awayStats.possession}%` : '-'}
            label="Ball Possession"
          />
        )}

        {(homeStats.shotsOnTarget !== undefined || awayStats.shotsOnTarget !== undefined) && (
          <StatisticRow
            homeValue={homeStats.shotsOnTarget ?? '-'}
            awayValue={awayStats.shotsOnTarget ?? '-'}
            label="Shots on Goal"
          />
        )}

        {(homeStats.shots !== undefined || awayStats.shots !== undefined) && (
          <StatisticRow
            homeValue={homeStats.shots ?? '-'}
            awayValue={awayStats.shots ?? '-'}
            label="Total Shots"
          />
        )}

        {(homeStats.shotsOffTarget !== undefined || awayStats.shotsOffTarget !== undefined) && (
          <StatisticRow
            homeValue={homeStats.shotsOffTarget ?? '-'}
            awayValue={awayStats.shotsOffTarget ?? '-'}
            label="Shots off Goal"
          />
        )}

        {(homeStats.blockedShots !== undefined || awayStats.blockedShots !== undefined) && (
          <StatisticRow
            homeValue={homeStats.blockedShots ?? '-'}
            awayValue={awayStats.blockedShots ?? '-'}
            label="Blocked Shots"
          />
        )}

        {(homeStats.corners !== undefined || awayStats.corners !== undefined) && (
          <StatisticRow
            homeValue={homeStats.corners ?? '-'}
            awayValue={awayStats.corners ?? '-'}
            label="Corner Kicks"
          />
        )}

        {(homeStats.offsides !== undefined || awayStats.offsides !== undefined) && (
          <StatisticRow
            homeValue={homeStats.offsides ?? '-'}
            awayValue={awayStats.offsides ?? '-'}
            label="Offsides"
          />
        )}

        {(homeStats.fouls !== undefined || awayStats.fouls !== undefined) && (
          <StatisticRow
            homeValue={homeStats.fouls ?? '-'}
            awayValue={awayStats.fouls ?? '-'}
            label="Fouls"
          />
        )}

        {(homeStats.yellowCards !== undefined || awayStats.yellowCards !== undefined) && (
          <StatisticRow
            homeValue={homeStats.yellowCards ?? '-'}
            awayValue={awayStats.yellowCards ?? '-'}
            label="Yellow Cards"
          />
        )}

        {(homeStats.redCards !== undefined || awayStats.redCards !== undefined) && (
          <StatisticRow
            homeValue={homeStats.redCards ?? '-'}
            awayValue={awayStats.redCards ?? '-'}
            label="Red Cards"
          />
        )}

        {(homeStats.saves !== undefined || awayStats.saves !== undefined) && (
          <StatisticRow
            homeValue={homeStats.saves ?? '-'}
            awayValue={awayStats.saves ?? '-'}
            label="Goalkeeper Saves"
          />
        )}

        {(homeStats.totalPasses !== undefined || awayStats.totalPasses !== undefined) && (
          <StatisticRow
            homeValue={homeStats.totalPasses ?? '-'}
            awayValue={awayStats.totalPasses ?? '-'}
            label="Total Passes"
          />
        )}

        {(homeStats.passesAccurate !== undefined || awayStats.passesAccurate !== undefined) && (
          <StatisticRow
            homeValue={homeStats.passesAccurate ?? '-'}
            awayValue={awayStats.passesAccurate ?? '-'}
            label="Passes Accurate"
          />
        )}

        {(homeStats.passAccuracy !== undefined || awayStats.passAccuracy !== undefined) && (
          <StatisticRow
            homeValue={homeStats.passAccuracy ? `${homeStats.passAccuracy}%` : '-'}
            awayValue={awayStats.passAccuracy ? `${awayStats.passAccuracy}%` : '-'}
            label="Pass Accuracy"
          />
        )}
      </div>
    </div>
  );
};

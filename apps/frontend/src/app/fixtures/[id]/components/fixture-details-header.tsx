'use client';

import React, { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components';
import Image from 'next/image';

const GET_MATCH_DETAILS = gql`
  query GetMatchDetails($matchId: String!) {
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
      homeScore
      awayScore
      homePenaltyScore
      awayPenaltyScore
      status
      startTime
      isLive
      isFinished
      minute
      league {
        id
        name
        displayName
      }
    }
  }
`;

export const FixtureDetailsHeader = () => {
  const params = useParams();
  const matchId = params.id as string;

  const { data, loading, error, startPolling, stopPolling } = useQuery(GET_MATCH_DETAILS, {
    variables: { matchId },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (data?.match) {
      const match = data.match;

      if (match.isLive) {
        startPolling(10000);
      } else if (!match.isFinished) {
        startPolling(60000);
      } else {
        stopPolling();
      }
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [data?.match?.isLive, data?.match?.isFinished, startPolling, stopPolling]);

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !data?.match) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Failed to load match details</p>
      </div>
    );
  }

  const match = data.match;
  const homeTeam = match.homeTeam;
  const awayTeam = match.awayTeam;
  const score =
    match.isFinished || match.isLive
      ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`
      : '- - -';
  const time =
    match.isLive && match.minute
      ? `${match.minute}'`
      : match.isFinished
        ? 'FT'
        : match.startTime
          ? new Date(match.startTime).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          : 'TBD';
  return (
    <div className="flex items-center justify-between gap-8  p-6">
      <div className="flex flex-col items-center shrink-0 flex-1 ">
        {homeTeam.logo && (
          <div className="w-12 h-12 relative mb-1">
            <Image
              src={homeTeam.logo}
              alt={`${homeTeam.name} logo`}
              fill
              className="object-contain"
            />
          </div>
        )}
        <p className="font-medium text-sm text-text-grey">{homeTeam.name}</p>
      </div>

      <div className="flex flex-col items-center">
        <div className="text-3xl font-bold mb-1">{score}</div>
        <div className="text-sm text-text-grey">{time}</div>
      </div>

      <div className="flex flex-col items-center shrink-0  flex-1">
        {awayTeam.logo && (
          <div className="w-12 h-12 relative mb-1">
            <Image
              src={awayTeam.logo}
              alt={`${awayTeam.name} logo`}
              fill
              className="object-contain"
            />
          </div>
        )}
        <p className="font-medium text-sm text-text-grey">{awayTeam.name}</p>
      </div>
    </div>
  );
};

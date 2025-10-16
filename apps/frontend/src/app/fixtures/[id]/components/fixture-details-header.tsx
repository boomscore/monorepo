'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import { NestedCards, Skeleton } from '@/components';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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

  const { data, loading, error } = useQuery(GET_MATCH_DETAILS, {
    variables: { matchId },
  });

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

  const getMatchStatus = () => {
    if (match.isLive && match.minute) {
      return `LIVE (${match.minute}')`;
    }
    if (match.isFinished) {
      return 'FULL TIME';
    }
    if (match.startTime) {
      const startTime = new Date(match.startTime);
      return startTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    return match.status;
  };

  return (
    <div className="text-center p-4">
      <div className="flex items-center justify-center gap-8 max-w-sm mx-auto">
        {/* Home Team */}
        <div className="flex flex-col items-center">
          {homeTeam.logo && (
            <div className="w-8 h-8 relative mb-1">
              <Image
                src={homeTeam.logo}
                alt={`${homeTeam.name} logo`}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          )}
          <span className="font-semibold text-sm">{homeTeam.name}</span>
        </div>

        {/* Score/Time */}
        <div className="flex flex-col items-center">
          <div className="text-lg font-bold mb-1">
            {match.isFinished || match.isLive
              ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`
              : '- -'}
          </div>
          <div className="text-sm text-gray-600">
            {match.isLive && match.minute
              ? `${match.minute}'`
              : match.isFinished
                ? 'FT'
                : match.startTime
                  ? new Date(match.startTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })
                  : 'TBD'}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center">
          {awayTeam.logo && (
            <div className="w-8 h-8 relative mb-1">
              <Image
                src={awayTeam.logo}
                alt={`${awayTeam.name} logo`}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          )}
          <span className="font-semibold text-sm">{awayTeam.name}</span>
        </div>
      </div>
    </div>
  );
};

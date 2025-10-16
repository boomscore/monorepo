'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Skeleton } from '@/components';
import Image from 'next/image';
// Define local types for match data structure
interface TeamMatch {
  id: string;
  homeTeam: { id: string; name: string; logo?: string };
  awayTeam: { id: string; name: string; logo?: string };
  homeScore?: number;
  awayScore?: number;
  startTime: string;
  league: { name: string };
}

const GET_TEAM_RECENT_MATCHES = gql`
  query GetTeamRecentMatches($teamId: String!, $limit: Float) {
    teamRecentMatches(teamId: $teamId, limit: $limit) {
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
      startTime
      league {
        name
      }
    }
  }
`;

const GET_TEAM_UPCOMING_MATCHES = gql`
  query GetTeamUpcomingMatches($teamId: String!, $limit: Float) {
    teamUpcomingMatches(teamId: $teamId, limit: $limit) {
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
      startTime
      league {
        name
      }
    }
  }
`;

interface RecentUpcomingProps {
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  limit?: number;
}

interface MatchRowProps {
  match: TeamMatch;
  teamId: string;
  teamName: string;
  isUpcoming?: boolean;
}

const MatchRow: React.FC<MatchRowProps> = ({ match, teamId, teamName, isUpcoming = false }) => {
  const matchDate = new Date(match.startTime);

  // Determine if current team is home or away
  const isCurrentTeamHome = match.homeTeam.id === teamId || match.homeTeam.name === teamName;
  const opponent = isCurrentTeamHome ? match.awayTeam : match.homeTeam;
  const currentTeamScore = isCurrentTeamHome ? match.homeScore : match.awayScore;
  const opponentScore = isCurrentTeamHome ? match.awayScore : match.homeScore;

  return (
    <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2 mb-2">
      <div className="text-gray-600 min-w-[50px]">
        {matchDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
      </div>

      <div className="flex items-center gap-2 flex-1 justify-center">
        {/* Current Team Name */}
        <span className="font-medium text-xs">{teamName}</span>

        <span className="text-gray-500">vs</span>

        {/* Opponent Logo */}
        {opponent.logo ? (
          <div className="w-4 h-4 relative">
            <Image
              src={opponent.logo}
              alt={opponent.name}
              width={16}
              height={16}
              className="object-contain"
            />
          </div>
        ) : (
          <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-[8px] font-bold text-gray-600">{opponent.name.charAt(0)}</span>
          </div>
        )}

        {/* Opponent Name */}
        <span className="font-medium text-xs">{opponent.name}</span>

        {/* Score */}
        <div className="font-bold ml-2">
          {isUpcoming ? '-' : `${currentTeamScore ?? '-'}-${opponentScore ?? '-'}`}
        </div>
      </div>
    </div>
  );
};

export const RecentUpcoming: React.FC<RecentUpcomingProps> = ({
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  limit = 5,
}) => {
  const { data: homeRecentData, loading: homeRecentLoading } = useQuery(GET_TEAM_RECENT_MATCHES, {
    variables: { teamId: homeTeamId, limit },
  });

  const { data: homeUpcomingData, loading: homeUpcomingLoading } = useQuery(
    GET_TEAM_UPCOMING_MATCHES,
    {
      variables: { teamId: homeTeamId, limit },
    },
  );

  const { data: awayRecentData, loading: awayRecentLoading } = useQuery(GET_TEAM_RECENT_MATCHES, {
    variables: { teamId: awayTeamId, limit },
  });

  const { data: awayUpcomingData, loading: awayUpcomingLoading } = useQuery(
    GET_TEAM_UPCOMING_MATCHES,
    {
      variables: { teamId: awayTeamId, limit },
    },
  );

  if (homeRecentLoading || homeUpcomingLoading || awayRecentLoading || awayUpcomingLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-base mb-4">Recent & Upcoming</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const homeRecentMatches = homeRecentData?.teamRecentMatches || [];
  const homeUpcomingMatches = homeUpcomingData?.teamUpcomingMatches || [];
  const awayRecentMatches = awayRecentData?.teamRecentMatches || [];
  const awayUpcomingMatches = awayUpcomingData?.teamUpcomingMatches || [];

  return (
    <div className="p-4">
      <h3 className="font-semibold text-base mb-6">Recent & Upcoming</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Home Team Column */}
        <div>
          <h4 className="font-medium text-sm mb-4">{homeTeamName} – Last 5</h4>
          <div className="space-y-1 mb-6">
            {homeRecentMatches.length > 0 ? (
              homeRecentMatches
                .slice(0, 5)
                .map((match: TeamMatch) => (
                  <MatchRow
                    key={match.id}
                    match={match}
                    teamId={homeTeamId}
                    teamName={homeTeamName}
                  />
                ))
            ) : (
              <div className="text-xs text-gray-500 py-2">No recent matches found</div>
            )}
          </div>

          <h4 className="font-medium text-sm mb-4">{homeTeamName} – Next 5</h4>
          <div className="space-y-1">
            {homeUpcomingMatches.length > 0 ? (
              homeUpcomingMatches
                .slice(0, 5)
                .map((match: TeamMatch) => (
                  <MatchRow
                    key={match.id}
                    match={match}
                    teamId={homeTeamId}
                    teamName={homeTeamName}
                    isUpcoming
                  />
                ))
            ) : (
              <div className="text-xs text-gray-500 py-2">No upcoming matches found</div>
            )}
          </div>
        </div>

        {/* Away Team Column */}
        <div>
          <h4 className="font-medium text-sm mb-4">{awayTeamName} – Last 5</h4>
          <div className="space-y-1 mb-6">
            {awayRecentMatches.length > 0 ? (
              awayRecentMatches
                .slice(0, 5)
                .map((match: TeamMatch) => (
                  <MatchRow
                    key={match.id}
                    match={match}
                    teamId={awayTeamId}
                    teamName={awayTeamName}
                  />
                ))
            ) : (
              <div className="text-xs text-gray-500 py-2">No recent matches found</div>
            )}
          </div>

          <h4 className="font-medium text-sm mb-4">{awayTeamName} – Next 5</h4>
          <div className="space-y-1">
            {awayUpcomingMatches.length > 0 ? (
              awayUpcomingMatches
                .slice(0, 5)
                .map((match: TeamMatch) => (
                  <MatchRow
                    key={match.id}
                    match={match}
                    teamId={awayTeamId}
                    teamName={awayTeamName}
                    isUpcoming
                  />
                ))
            ) : (
              <div className="text-xs text-gray-500 py-2">No upcoming matches found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

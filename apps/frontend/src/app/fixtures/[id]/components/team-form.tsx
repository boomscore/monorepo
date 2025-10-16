'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Skeleton } from '@/components';
// Define local types for team match data structure
interface TeamMatch {
  id: string;
  homeTeam: { id: string; name: string; logo?: string };
  awayTeam: { id: string; name: string; logo?: string };
  homeScore?: number;
  awayScore?: number;
  startTime: string;
  league: { name: string };
}
import Image from 'next/image';

const GET_TEAM_MATCHES = gql`
  query GetTeamMatches($teamId: String!, $limit: Float) {
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

interface TeamFormProps {
  teamId: string;
  teamName: string;
  isHome?: boolean;
  limit?: number;
}

const getMatchResult = (match: TeamMatch, teamId: string) => {
  const isHome = match.homeTeam.id === teamId;
  const teamScore = isHome ? match.homeScore : match.awayScore;
  const opponentScore = isHome ? match.awayScore : match.homeScore;

  if (teamScore !== undefined && opponentScore !== undefined) {
    if (teamScore > opponentScore) return 'W';
    if (teamScore < opponentScore) return 'L';
    return 'D';
  }

  return 'N/A'; // No result available
};

const getResultColor = (result: string) => {
  switch (result) {
    case 'W':
      return 'bg-green-500 text-white';
    case 'L':
      return 'bg-red-500 text-white';
    case 'D':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-300 text-gray-700';
  }
};

export const TeamForm: React.FC<TeamFormProps> = ({
  teamId,
  teamName,
  isHome = false,
  limit = 5,
}) => {
  const { data, loading, error } = useQuery(GET_TEAM_MATCHES, {
    variables: { teamId, limit },
  });

  if (loading) {
    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-sm mb-3">
          {teamName} - {isHome ? 'Home' : 'Away'} Form
        </h4>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        <p>Team form data not available</p>
      </div>
    );
  }

  const recentMatches = data.teamRecentMatches || [];
  const upcomingMatches = data.teamUpcomingMatches || [];

  // Calculate form from recent matches
  const form = recentMatches.map((match: TeamMatch) => getMatchResult(match, teamId));

  return (
    <div>
      <h4 className="font-semibold text-sm mb-3">
        {teamName} - {isHome ? 'Home' : 'Away'} Form
      </h4>

      {/* Form Indicators */}
      {form.length > 0 && (
        <div className="flex gap-1 mb-4">
          <span className="text-xs text-gray-600 mr-2">Recent:</span>
          {form.slice(0, 5).map((result: string, index: number) => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getResultColor(result)}`}
            >
              {result}
            </div>
          ))}
        </div>
      )}

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <div className="mb-4">
          <h5 className="text-xs font-medium text-gray-600 mb-2">Last 5 Matches</h5>
          <div className="space-y-2">
            {recentMatches.slice(0, 3).map((match: TeamMatch) => {
              const isTeamHome = match.homeTeam.id === teamId;
              const opponent = isTeamHome ? match.awayTeam : match.homeTeam;
              const result = getMatchResult(match, teamId);
              const matchDate = new Date(match.startTime);

              return (
                <div
                  key={match.id}
                  className="flex items-center justify-between text-xs border-b border-gray-100 pb-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded text-center text-[10px] font-bold ${getResultColor(result)}`}
                    >
                      {result}
                    </div>
                    <span className="text-gray-600">{isTeamHome ? 'vs' : '@'}</span>
                    <div className="flex items-center gap-1">
                      {opponent.logo && (
                        <div className="w-4 h-4 relative">
                          <Image
                            src={opponent.logo}
                            alt={opponent.name}
                            width={16}
                            height={16}
                            className="object-contain"
                          />
                        </div>
                      )}
                      <span className="truncate max-w-[80px]">{opponent.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {isTeamHome
                        ? `${match.homeScore}-${match.awayScore}`
                        : `${match.awayScore}-${match.homeScore}`}
                    </div>
                    <div className="text-gray-500">{matchDate.toLocaleDateString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-gray-600 mb-2">Next 3 Matches</h5>
          <div className="space-y-2">
            {upcomingMatches.slice(0, 3).map((match: TeamMatch) => {
              const isTeamHome = match.homeTeam.id === teamId;
              const opponent = isTeamHome ? match.awayTeam : match.homeTeam;
              const matchDate = new Date(match.startTime);

              return (
                <div
                  key={match.id}
                  className="flex items-center justify-between text-xs border-b border-gray-100 pb-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-100 text-center text-[10px] font-bold text-blue-600">
                      ?
                    </div>
                    <span className="text-gray-600">{isTeamHome ? 'vs' : '@'}</span>
                    <div className="flex items-center gap-1">
                      {opponent.logo && (
                        <div className="w-4 h-4 relative">
                          <Image
                            src={opponent.logo}
                            alt={opponent.name}
                            width={16}
                            height={16}
                            className="object-contain"
                          />
                        </div>
                      )}
                      <span className="truncate max-w-[80px]">{opponent.name}</span>
                    </div>
                  </div>
                  <div className="text-right text-gray-500">
                    <div>{matchDate.toLocaleDateString()}</div>
                    <div>{match.league.name}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recentMatches.length === 0 && upcomingMatches.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-xs">
          No recent or upcoming matches found
        </div>
      )}
    </div>
  );
};

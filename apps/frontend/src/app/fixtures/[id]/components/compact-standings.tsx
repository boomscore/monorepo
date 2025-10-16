'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Skeleton } from '@/components';
interface StandingTeam {
  teamName: string;
  position: number;
  points: number;
  form?: string;
}

const GET_LEAGUE_STANDINGS = gql`
  query GetLeagueStandings($leagueId: String!, $season: Float, $limit: Float) {
    leagueStandings(leagueId: $leagueId, season: $season, limit: $limit)
  }
`;

interface CompactStandingsProps {
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  season?: number;
}

export const CompactStandings: React.FC<CompactStandingsProps> = ({
  leagueId,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  season,
}) => {
  const { data, loading, error } = useQuery(GET_LEAGUE_STANDINGS, {
    variables: { leagueId, season, limit: 25 },
  });

  if (loading) {
    return (
      <div className="space-y-2">
        <h3 className="font-semibold text-base mb-4">Standings</h3>
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error || !data?.leagueStandings) {
    return (
      <div className="text-center py-4 text-gray-500">
        <h3 className="font-semibold text-base mb-4">Standings</h3>
        <p>Standings not available</p>
      </div>
    );
  }

  const standings = data.leagueStandings?.standings || [];

  const homeTeamData = standings.find(
    (team: StandingTeam) => team.teamName?.toLowerCase() === homeTeamName?.toLowerCase(),
  );
  const awayTeamData = standings.find(
    (team: StandingTeam) => team.teamName?.toLowerCase() === awayTeamName?.toLowerCase(),
  );

  if (!homeTeamData && !awayTeamData) {
    return (
      <div className="text-center py-4 text-gray-500">
        <h3 className="font-semibold text-base mb-4">Standings</h3>
        <p>Team standings not found</p>
        <div className="text-xs mt-2 text-gray-400">
          Looking for: {homeTeamId} & {awayTeamId}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold text-base mb-4">Standings</h3>

      <div className="space-y-3">
        {homeTeamData && (
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">{homeTeamName}</div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-600">Rank</span>
                <div className="font-bold">{homeTeamData.position}</div>
              </div>
              <div>
                <span className="text-gray-600">Pts</span>
                <div className="font-bold">{homeTeamData.points}</div>
              </div>
              {homeTeamData.form && (
                <div>
                  <span className="text-gray-600">Form</span>
                  <div className="font-mono text-xs font-bold">{homeTeamData.form}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Away Team */}
        {awayTeamData && (
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">{awayTeamName}</div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-600">Rank</span>
                <div className="font-bold">{awayTeamData.position}</div>
              </div>
              <div>
                <span className="text-gray-600">Pts</span>
                <div className="font-bold">{awayTeamData.points}</div>
              </div>
              {awayTeamData.form && (
                <div>
                  <span className="text-gray-600">Form</span>
                  <div className="font-mono text-xs font-bold">{awayTeamData.form}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

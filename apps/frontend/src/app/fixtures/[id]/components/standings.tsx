'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Skeleton } from '@/components';
// Define local types for standings data structure
interface StandingTeam {
  teamId: string;
  teamName: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

const GET_LEAGUE_STANDINGS = gql`
  query GetLeagueStandings($leagueId: String!, $season: Float, $limit: Float) {
    leagueStandings(leagueId: $leagueId, season: $season, limit: $limit)
  }
`;

interface StandingsProps {
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  season?: number;
  limit?: number;
}

export const Standings: React.FC<StandingsProps> = ({
  leagueId,
  homeTeamId,
  awayTeamId,
  season,
  limit = 20,
}) => {
  const { data, loading, error } = useQuery(GET_LEAGUE_STANDINGS, {
    variables: { leagueId, season, limit },
  });

  if (loading) {
    return (
      <div className="space-y-2">
        <h3 className="font-semibold text-base mb-4">League Standings</h3>
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (error || !data?.leagueStandings) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>Standings not available</p>
      </div>
    );
  }

  const standings = data.leagueStandings?.standings || [];

  return (
    <div>
      <h3 className="font-semibold text-base mb-4">League Standings</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600">
              <th className="text-left py-2 pr-4">Pos</th>
              <th className="text-left py-2 pr-4">Team</th>
              <th className="text-center py-2 px-2">MP</th>
              <th className="text-center py-2 px-2">W</th>
              <th className="text-center py-2 px-2">D</th>
              <th className="text-center py-2 px-2">L</th>
              <th className="text-center py-2 px-2">GF</th>
              <th className="text-center py-2 px-2">GA</th>
              <th className="text-center py-2 px-2">GD</th>
              <th className="text-center py-2 px-2">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team: StandingTeam, index: number) => {
              const isHomeTeam = team.teamId === homeTeamId;
              const isAwayTeam = team.teamId === awayTeamId;
              const isHighlighted = isHomeTeam || isAwayTeam;

              return (
                <tr
                  key={team.teamId || index}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    isHighlighted ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <td className="py-2 pr-4 font-medium">{team.position}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`truncate ${isHighlighted ? 'font-semibold text-blue-700' : ''}`}
                    >
                      {team.teamName}
                    </span>
                  </td>
                  <td className="text-center py-2 px-2">{team.played}</td>
                  <td className="text-center py-2 px-2">{team.won}</td>
                  <td className="text-center py-2 px-2">{team.drawn}</td>
                  <td className="text-center py-2 px-2">{team.lost}</td>
                  <td className="text-center py-2 px-2">{team.goalsFor}</td>
                  <td className="text-center py-2 px-2">{team.goalsAgainst}</td>
                  <td className="text-center py-2 px-2 font-medium">
                    {(team.goalsFor || 0) - (team.goalsAgainst || 0)}
                  </td>
                  <td className="text-center py-2 px-2 font-bold">{team.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

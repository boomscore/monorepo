'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, Separator, Skeleton } from '@/components';
import Image from 'next/image';
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
  homeTeamLogo: string;
  awayTeamLogo: string;
}

export const CompactStandings: React.FC<CompactStandingsProps> = ({
  leagueId,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  season,
  homeTeamLogo,
  awayTeamLogo,
}) => {
  const { data, loading, error } = useQuery(GET_LEAGUE_STANDINGS, {
    variables: { leagueId, season, limit: 25 },
  });

  if (loading) {
    return (
      <div>
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error || !data?.leagueStandings) {
    return (
      <div className="text-center py-4">
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
        <p>Team standings not found</p>
        <div className="text-xs mt-2 text-gray-400">
          Looking for: {homeTeamId} & {awayTeamId}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-2">
      <Card className="flex-1 bg-app-background border-none">
        <CardContent>
          <div>
            <div className="flex items-center gap-2">
              <Image
                src={homeTeamLogo}
                alt={homeTeamName}
                width={16}
                height={16}
                className="object-contain"
              />
              <div className="font-medium text-sm">{homeTeamName}</div>
            </div>

            <div className="border border-border rounded-lg grid grid-cols-3 mt-2">
              <div className="p-4 text-center">
                <p className="text-text-grey">Rank</p>
                <p className="font-medium text-sm">{homeTeamData.position}</p>
              </div>

              <div className="p-4 text-center border-x border-border">
                <p className="text-text-grey">Points</p>
                <p className="font-medium text-sm">{homeTeamData.points}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-text-grey">Form</p>
                <p className="font-medium text-sm">{homeTeamData.form || '-'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="flex-1 bg-app-background border-none">
        <CardContent>
          <div>
            <div className="flex items-center gap-2">
              <Image
                src={awayTeamLogo}
                alt={awayTeamName}
                width={16}
                height={16}
                className="object-contain"
              />
              <div className="font-medium text-sm">{awayTeamName}</div>
            </div>
            <div className="border border-border rounded-lg grid grid-cols-3 mt-2">
              <div className="p-4 text-center">
                <p className="text-text-grey">Rank</p>
                <p className="font-medium text-sm">{awayTeamData.position}</p>
              </div>
              <div className="p-4 text-center border-x border-border">
                <p className="text-text-grey">Points</p>
                <p className="font-medium text-sm">{awayTeamData.points}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-text-grey">Form</p>
                <p className="font-medium text-sm">{awayTeamData.form || '-'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

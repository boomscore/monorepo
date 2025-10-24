'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Skeleton } from '@/components';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FixtureCard } from '../../components/fixture-card';
import Image from 'next/image';

type TeamMatch = {
  id: string;
  homeTeam: { id: string; name: string; logo?: string };
  awayTeam: { id: string; name: string; logo?: string };
  homeScore?: number;
  awayScore?: number;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
  homeExtraTimeScore?: number;
  awayExtraTimeScore?: number;
  startTime: string;
  isLive?: boolean;
  isFinished?: boolean;
  hasStarted?: boolean;
  status?: string;
  minute?: number;
  league: { name: string };
};

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
      homePenaltyScore
      awayPenaltyScore
      homeExtraTimeScore
      awayExtraTimeScore
      startTime
      isLive
      isFinished
      hasStarted
      status
      minute
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
      homeScore
      awayScore
      homePenaltyScore
      awayPenaltyScore
      homeExtraTimeScore
      awayExtraTimeScore
      startTime
      isLive
      isFinished
      hasStarted
      status
      minute
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
  homeTeamLogo: string;
  awayTeamLogo: string;
}

export const RecentUpcoming: React.FC<RecentUpcomingProps> = ({
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  limit = 5,
  homeTeamLogo,
  awayTeamLogo,
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
      <div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const homeRecentMatches = homeRecentData?.teamRecentMatches || [];
  const homeUpcomingMatches = homeUpcomingData?.teamUpcomingMatches || [];
  const awayRecentMatches = awayRecentData?.teamRecentMatches || [];
  const awayUpcomingMatches = awayUpcomingData?.teamUpcomingMatches || [];

  return (
    <section className="space-y-4">
      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-2">
                <div className="flex items-center gap-2">
                  <Image src={homeTeamLogo} alt={homeTeamName} width={20} height={20} />
                  <p className="font-medium text-sm">{homeTeamName}</p>
                </div>
                <div className="space-y-2 mt-2">
                  {homeRecentMatches.length > 0 ? (
                    homeRecentMatches.map((match: TeamMatch) => (
                      <FixtureCard key={match.id} match={match as any} showDate={true} />
                    ))
                  ) : (
                    <div className="text-sm text-text-grey py-4 text-center">
                      No recent matches found
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card rounded-xl p-2">
                <div className="flex items-center gap-2">
                  <Image src={awayTeamLogo} alt={awayTeamName} width={20} height={20} />
                  <p className="font-medium text-sm">{awayTeamName}</p>
                </div>
                <div className="space-y-2 mt-2">
                  {awayRecentMatches.length > 0 ? (
                    awayRecentMatches.map((match: TeamMatch) => (
                      <FixtureCard key={match.id} match={match as any} showDate={true} />
                    ))
                  ) : (
                    <div className="text-sm text-text-grey py-4 text-center">
                      No recent matches found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-2">
                <div className="flex items-center gap-2">
                  <Image src={homeTeamLogo} alt={homeTeamName} width={20} height={20} />
                  <p className="font-medium text-sm">{homeTeamName}</p>
                </div>
                <div className="space-y-2 mt-2">
                  {homeUpcomingMatches.length > 0 ? (
                    homeUpcomingMatches.map((match: TeamMatch) => (
                      <FixtureCard key={match.id} match={match as any} showDate={true} />
                    ))
                  ) : (
                    <div className="text-sm text-text-grey py-4 text-center">
                      No upcoming matches found
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card rounded-xl p-2">
                <div className="flex items-center gap-2">
                  <Image src={awayTeamLogo} alt={awayTeamName} width={20} height={20} />
                  <p className="font-medium text-sm">{awayTeamName}</p>
                </div>
                <div className="space-y-2 mt-2">
                  {awayUpcomingMatches.length > 0 ? (
                    awayUpcomingMatches.map((match: TeamMatch) => (
                      <FixtureCard key={match.id} match={match as any} showDate={true} />
                    ))
                  ) : (
                    <div className="text-sm text-text-grey py-4 text-center">
                      No upcoming matches found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

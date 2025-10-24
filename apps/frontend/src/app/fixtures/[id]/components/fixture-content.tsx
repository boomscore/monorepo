'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery, gql } from '@apollo/client';
import { NestedCards, Skeleton } from '@/components';
import { FixtureDetailsHeader } from './fixture-details-header';
import { CompactStandings } from './compact-standings';
import { HeadToHead } from './head-to-head';
import { RecentUpcoming } from './recent-upcoming';
import { MatchStatistics } from './match-statistics';

const GET_MATCH_FOR_DETAILS = gql`
  query GetMatchForDetails($matchId: String!) {
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
      league {
        id
      }
    }
  }
`;

export const FixtureContent = () => {
  const params = useParams();
  const matchId = params.id as string;

  const { data, loading, error } = useQuery(GET_MATCH_FOR_DETAILS, {
    variables: { matchId },
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <FixtureDetailsHeader />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !data?.match) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Failed to load match details</p>
      </div>
    );
  }

  const match = data.match;

  return (
    <div className="space-y-6">
      <NestedCards
        header={<div />}
        footer={<FixtureDetailsHeader />}
        padding="none"
        direction="reverse"
      />

      <NestedCards
        header={
          <div className="p-2">
            <h3 className="font-semibold text-sm">Match Statistics</h3>
          </div>
        }
        footer={<MatchStatistics matchId={match.id} />}
        padding="px"
      />

      <NestedCards
        header={
          <div className="p-2">
            <h3 className="font-semibold text-sm">Standings</h3>
          </div>
        }
        footer={
          <CompactStandings
            leagueId={match.league.id}
            homeTeamId={match.homeTeam.id}
            awayTeamId={match.awayTeam.id}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
            homeTeamLogo={match.homeTeam.logo}
            awayTeamLogo={match.awayTeam.logo}
          />
        }
        padding="px"
        bottomCardClassName="bg-transparent border-none"
      />

      <NestedCards
        header={
          <div className="p-2">
            <h3 className="font-semibold text-sm">Head to Head</h3>
          </div>
        }
        footer={
          <HeadToHead
            homeTeamId={match.homeTeam.id}
            awayTeamId={match.awayTeam.id}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
            homeTeamLogo={match.homeTeam.logo}
            awayTeamLogo={match.awayTeam.logo}
          />
        }
        padding="px"
      />

      <NestedCards
        header={
          <div className="p-2">
            <h3 className="font-semibold text-sm">Recent and upcoming fixtures</h3>
          </div>
        }
        footer={
          <RecentUpcoming
            homeTeamId={match.homeTeam.id}
            awayTeamId={match.awayTeam.id}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
            homeTeamLogo={match.homeTeam.logo}
            awayTeamLogo={match.awayTeam.logo}
          />
        }
        padding="px"
      />
    </div>
  );
};

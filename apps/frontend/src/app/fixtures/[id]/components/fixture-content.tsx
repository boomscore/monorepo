'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery, gql } from '@apollo/client';
import { NestedCards, Skeleton } from '@/components';
import { FixtureDetailsHeader } from './fixture-details-header';
import { CompactStandings } from './compact-standings';
import { HeadToHead } from './head-to-head';
import { RecentUpcoming } from './recent-upcoming';

const GET_MATCH_FOR_DETAILS = gql`
  query GetMatchForDetails($matchId: String!) {
    match(id: $matchId) {
      id
      homeTeam {
        id
        name
      }
      awayTeam {
        id
        name
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
      {/* Match Header */}
      <NestedCards header={<FixtureDetailsHeader />} footer={<div />} padding="none" />

      {/* Compact Standings */}
      <NestedCards
        header={
          <CompactStandings
            leagueId={match.league.id}
            homeTeamId={match.homeTeam.id}
            awayTeamId={match.awayTeam.id}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
          />
        }
        footer={<div />}
        padding="sm"
      />

      {/* Head to Head */}
      <NestedCards
        header={
          <HeadToHead
            homeTeamId={match.homeTeam.id}
            awayTeamId={match.awayTeam.id}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
          />
        }
        footer={<div />}
        padding="sm"
      />

      {/* Recent & Upcoming */}
      <NestedCards
        header={
          <RecentUpcoming
            homeTeamId={match.homeTeam.id}
            awayTeamId={match.awayTeam.id}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
          />
        }
        footer={<div />}
        padding="sm"
      />
    </div>
  );
};

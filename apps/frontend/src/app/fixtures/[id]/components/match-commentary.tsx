'use client';

import React, { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, Skeleton } from '@/components';

const GET_MATCH_COMMENTARY = gql`
  query GetMatchCommentary($matchId: String!) {
    match(id: $matchId) {
      id
      status
      isLive
      homeTeam {
        name
      }
      awayTeam {
        name
      }
    }
    matchEvents(matchId: $matchId) {
      id
      type
      minute
      extraTime
      playerName
      description
      detail
      isHome
    }
  }
`;

interface MatchCommentaryProps {
  matchId: string;
}

export const MatchCommentary: React.FC<MatchCommentaryProps> = ({ matchId }) => {
  const { data, loading, error, startPolling, stopPolling } = useQuery(GET_MATCH_COMMENTARY, {
    variables: { matchId },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (data?.match?.isLive) {
      startPolling(30000);
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [data?.match?.isLive, startPolling, stopPolling]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error || !data?.match) {
    return (
      <div className="text-center py-4 text-text-grey">
        <p className="text-sm">Failed to load match commentary</p>
      </div>
    );
  }

  const match = data.match;
  const events = data.matchEvents || [];

  const generateCommentary = (event: any) => {
    const teamName = event.isHome ? match.homeTeam.name : match.awayTeam.name;

    switch (event.type.toLowerCase()) {
      case 'goal':
        return {
          title: `GOAL! ${teamName}`,
          description: `${event.playerName} finds the back of the net! ${event.assistPlayerName ? `Great assist from ${event.assistPlayerName}.` : ''} ${event.detail ? `${event.detail}.` : ''}`,
        };
      case 'yellow_card':
        return {
          title: `Yellow Card - ${teamName}`,
          description: `${event.playerName} receives a yellow card. ${event.detail || 'Caution shown by the referee.'}`,
        };
      case 'red_card':
        return {
          title: `Red Card - ${teamName}`,
          description: `${event.playerName} is sent off! ${event.detail || 'The referee shows the red card.'}`,
        };
      case 'substitution':
        return {
          title: `Substitution - ${teamName}`,
          description: `${event.playerName} comes on for ${teamName}. Tactical change by the manager.`,
        };
      case 'missed_penalty':
        return {
          title: `Missed Penalty - ${teamName}`,
          description: `${event.playerName} missed the penalty.`,
        };
      default:
        return {
          title: `${event.type} - ${teamName}`,
          description: event.description || `${event.playerName} involved in play.`,
        };
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-text-grey">
        <p className="text-sm">No commentary available</p>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => {
    const aMinute = a.minute + (a.extraTime || 0);
    const bMinute = b.minute + (b.extraTime || 0);
    return bMinute - aMinute;
  });

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {sortedEvents.map(event => {
          const commentary = generateCommentary(event);
          const minute = event.minute + (event.extraTime || 0);

          return (
            <div key={event.id} className="px-4 border-b border-border last:border-b-0 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                      {minute}'
                    </span>
                    <h4 className="text-sm">{commentary.title}</h4>
                  </div>
                  <p className="text-sm text-text-grey leading-relaxed">{commentary.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

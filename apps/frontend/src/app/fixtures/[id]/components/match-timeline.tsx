'use client';

import React, { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, Skeleton } from '@/components';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const GET_MATCH_EVENTS = gql`
  query GetMatchEvents($matchId: String!) {
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
      status
      isLive
    }
    matchEvents(matchId: $matchId) {
      id
      type
      minute
      extraTime
      playerName
      assistPlayerName
      description
      detail
      isHome
    }
  }
`;

interface MatchTimelineProps {
  matchId: string;
}

interface EventIconProps {
  eventType: string;
  className?: string;
}

const EventIcon: React.FC<EventIconProps> = ({ eventType, className = 'w-4 h-4' }) => {
  switch (eventType.toLowerCase()) {
    case 'goal':
      return <div>⚽</div>;
    case 'yellow_card':
      return <div className={cn(className, 'bg-yellow-400 rounded-sm')} />;
    case 'red_card':
      return <div className={cn(className, 'bg-red-500 rounded-sm')} />;
    case 'substitution':
      return (
        <div
          className={cn(
            className,
            'bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold',
          )}
        >
          ↔
        </div>
      );
    default:
      return <div className={cn(className, 'bg-gray-400 rounded-full')} />;
  }
};

export const MatchTimeline: React.FC<MatchTimelineProps> = ({ matchId }) => {
  const { data, loading, error, startPolling, stopPolling } = useQuery(GET_MATCH_EVENTS, {
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
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error || !data?.match) {
    return (
      <div className="text-center py-4 text-text-grey">
        <p className="text-sm">Failed to load match events</p>
      </div>
    );
  }

  const match = data.match;
  const events = data.matchEvents || [];

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-text-grey">
        <p className="text-sm">No events recorded for this match</p>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => {
    const aMinute = a.minute + (a.extraTime || 0);
    const bMinute = b.minute + (b.extraTime || 0);
    return aMinute - bMinute;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <Image
            src={match.homeTeam.logo}
            alt={match.homeTeam.name}
            width={20}
            height={20}
            className="object-contain"
          />
          <span className="text-sm font-medium">{match.homeTeam.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{match.awayTeam.name}</span>
          <Image
            src={match.awayTeam.logo}
            alt={match.awayTeam.name}
            width={20}
            height={20}
            className="object-contain"
          />
        </div>
      </div>

      <Card className="p-2 gap-2">
        {sortedEvents.map(event => (
          <div key={event.id} className="border-b border-border last:border-b-0 pb-2">
            <div className="grid grid-cols-3 items-center">
              {event.isHome ? (
                <>
                  <div className="flex items-center gap-3 flex-1 px-4">
                    <EventIcon eventType={event.type} />
                    <div>
                      <p className="text-sm">{event.playerName}</p>
                      {event.assistPlayerName && (
                        <p className="text-xs text-text-grey">Assist: {event.assistPlayerName}</p>
                      )}
                      {event.detail && <p className="text-xs text-text-grey">{event.detail}</p>}
                    </div>
                  </div>

                  <div className="text-center px-4">
                    <span className="text-sm font-medium">
                      {event.minute}
                      {event.extraTime ? `+${event.extraTime}` : ''}'
                    </span>
                  </div>

                  <div className="flex-1" />
                </>
              ) : (
                <>
                  <div className="flex-1" />

                  <div className="text-center px-4">
                    <span className="text-sm font-medium">
                      {event.minute}
                      {event.extraTime ? `+${event.extraTime}` : ''}'
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-1 justify-end px-4">
                    <div className="text-right">
                      <p className="text-sm ">{event.playerName}</p>
                      {event.assistPlayerName && (
                        <p className="text-xs text-text-grey">Assist: {event.assistPlayerName}</p>
                      )}
                      {event.detail && <p className="text-xs text-text-grey">{event.detail}</p>}
                    </div>
                    <EventIcon eventType={event.type} />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

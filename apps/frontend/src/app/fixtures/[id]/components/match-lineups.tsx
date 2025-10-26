'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, Skeleton } from '@/components';
import { cn } from '@/lib/utils';

const GET_MATCH_LINEUPS = gql`
  query GetMatchLineups($matchId: String!) {
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
    }
    matchLineups(matchId: $matchId) {
      homeTeam {
        name
        logo
        formation
        startXI {
          name
          number
          position
        }
        substitutes {
          name
          number
          position
        }
        coach
      }
      awayTeam {
        name
        logo
        formation
        startXI {
          name
          number
          position
        }
        substitutes {
          name
          number
          position
        }
        coach
      }
    }
    matchEvents(matchId: $matchId) {
      id
      type
      minute
      extraTime
      playerName
      assistPlayerName
      isHome
      description
      detail
    }
  }
`;

interface MatchLineupsProps {
  matchId: string;
}

interface MatchEvent {
  id: string;
  type: string;
  minute: number;
  extraTime?: number | null;
  playerName?: string | null;
  assistPlayerName?: string | null;
  isHome: boolean;
  description?: string | null;
  detail?: string | null;
}

interface PlayerCardProps {
  player: {
    name: string;
    number: number;
  };
  position: string;
  isHome: boolean;
  events?: MatchEvent[];
}

function PlayerCard({ player, position, isHome, events = [] }: PlayerCardProps) {
  // Find events for this player
  const playerEvents = events.filter(event => {
    const byName = event.playerName === player.name || event.assistPlayerName === player.name;
    if (byName) return true;

    // Fallback by last name matching (case-insensitive)
    const playerLast = player.name.split(' ').slice(-1)[0].toLowerCase();
    const evPlayerLast = (event.playerName || '').split(' ').slice(-1)[0].toLowerCase();
    const evAssistLast = (event.assistPlayerName || '').split(' ').slice(-1)[0].toLowerCase();

    return playerLast && (playerLast === evPlayerLast || playerLast === evAssistLast);
  });

  const goals = playerEvents.filter(e => e.type === 'GOAL' || e.type === 'PENALTY').length;

  const cards = playerEvents.filter(e => e.type === 'YELLOW_CARD' || e.type === 'RED_CARD');
  const substitutions = playerEvents.filter(e => e.type === 'SUBSTITUTION');

  const hasPenaltyGoal = playerEvents.some(
    e =>
      (e.type === 'GOAL' || e.type === 'PENALTY') &&
      (e.detail?.toLowerCase().includes('pen') || e.detail?.toLowerCase().includes('penalty')),
  );

  const hasYellow = cards.some(c => c.type === 'YELLOW_CARD');
  const hasRed = cards.some(c => c.type === 'RED_CARD');
  const isSubstituted = substitutions.some(s => s.detail?.includes('out'));

  return (
    <div className="flex flex-col items-center space-y-1 cursor-pointer hover:scale-105 transition-transform">
      <div className="relative">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all',
            isHome ? 'bg-blue-600 text-white' : 'bg-red-600 text-white',
            isSubstituted && 'opacity-60',
          )}
        >
          {player.number}
        </div>

        {/* Event Indicators */}
        <div className="absolute -top-1 -right-1 flex flex-col gap-0.5">
          {goals > 0 && (
            <div className="w-4 h-4 bg-black/50 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm">
              {hasPenaltyGoal ? 'P' : '⚽'}
            </div>
          )}

          {/* Cards */}
          {hasRed && <div className="w-4 h-4 bg-red-500 rounded-sm shadow-sm"></div>}
          {hasYellow && !hasRed && (
            <div className="w-4 h-4 bg-yellow-500 rounded-sm shadow-sm"></div>
          )}

          {/* Substitution */}
          {isSubstituted && (
            <div className="w-4 h-4 bg-muted text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
              ↔
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <div
          className={cn(
            'text-xs font-medium leading-tight',
            isSubstituted ? 'text-white/60' : 'text-white',
          )}
        >
          {player.name.split(' ').slice(-1)[0]} {/* Show last name only */}
        </div>

        {/* Goal count if more than 1 */}
        {goals > 1 && <div className="text-xs text-green-400 font-bold">{goals}⚽</div>}
      </div>
    </div>
  );
}

function getFormationLayout(formation: string, players: any[]) {
  // Parse formation (e.g., "4-3-3" -> [4, 3, 3])
  const formationNumbers = formation.split('-').map(Number);

  if (!players || players.length === 0) {
    return {
      goalkeeper: null,
      lines: [],
    };
  }

  // Find goalkeeper - first player is usually goalkeeper
  let goalkeeper = players[0];
  let outfieldPlayers = players.slice(1);

  // If first player doesn't look like goalkeeper, try to find by position
  if (
    !goalkeeper ||
    (!goalkeeper.position?.includes('G') && !goalkeeper.position?.includes('Goalkeeper'))
  ) {
    const gkIndex = players.findIndex(
      p => p && (p.position === 'G' || p.position === 'GK' || p.position === 'Goalkeeper'),
    );

    if (gkIndex !== -1) {
      goalkeeper = players[gkIndex];
      outfieldPlayers = players.filter((_, index) => index !== gkIndex);
    }
  }

  const lines: any[][] = [];
  let playerIndex = 0;

  // Create formation lines from back to front
  formationNumbers.forEach(lineCount => {
    const line = outfieldPlayers.slice(playerIndex, playerIndex + lineCount);
    lines.push(line);
    playerIndex += lineCount;
  });

  return { goalkeeper, lines };
}

export const MatchLineups: React.FC<MatchLineupsProps> = ({ matchId }) => {
  const { data, loading, error } = useQuery(GET_MATCH_LINEUPS, {
    variables: { matchId },
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error || !data?.match) {
    return (
      <div className="text-center py-8 text-text-grey">
        <p className="text-sm">Failed to load lineup data</p>
      </div>
    );
  }

  const match = data.match;
  const lineups = data.matchLineups;
  const matchEvents = data.matchEvents || [];

  if (!lineups?.homeTeam || !lineups?.awayTeam) {
    return (
      <div className="text-center py-8 text-text-grey">
        <p className="text-sm">Lineup data not available for this match</p>
      </div>
    );
  }

  const { goalkeeper: homeGK, lines: homeLines } = getFormationLayout(
    lineups.homeTeam.formation || '4-4-2',
    lineups.homeTeam.startXI || [],
  );

  const { goalkeeper: awayGK, lines: awayLines } = getFormationLayout(
    lineups.awayTeam.formation || '4-4-2',
    lineups.awayTeam.startXI || [],
  );

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-4">
          <div className="text-center mb-4">
            <span className="font-medium">
              {match.homeTeam.name} ({lineups.homeTeam.formation})
            </span>
          </div>

          {/* Football Pitch */}
          <div className="relative bg-gradient-to-b from-green-400 to-green-500 rounded-lg p-4 min-h-[600px]">
            {/* Pitch Lines */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Center line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40"></div>
              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white/40 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/40 rounded-full"></div>

              {/* Goal areas */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-8 border-2 border-white/40 border-t-0"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-8 border-2 border-white/40 border-b-0"></div>

              {/* Penalty areas */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-white/30 border-t-0"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-white/30 border-b-0"></div>
            </div>

            <div className="relative h-full flex flex-col justify-between">
              {/* Home Team (Top) */}
              <div className="flex-1 flex flex-col justify-start py-4 space-y-6">
                {/* Home Goalkeeper */}
                {homeGK && (
                  <div className="flex justify-center">
                    <PlayerCard
                      player={{
                        name: homeGK.name,
                        number: homeGK.number,
                      }}
                      position={homeGK.position}
                      isHome={true}
                      events={matchEvents.filter((e: MatchEvent) => e.isHome)}
                    />
                  </div>
                )}

                {/* Home Formation Lines */}
                {homeLines.map((line, lineIndex) => (
                  <div key={lineIndex} className="flex justify-center">
                    <div className="flex justify-evenly w-full max-w-lg">
                      {line.map((player, playerIndex) =>
                        player ? (
                          <PlayerCard
                            key={player.name || playerIndex}
                            player={{
                              name: player.name,
                              number: player.number,
                            }}
                            position={player.position}
                            isHome={true}
                            events={matchEvents.filter((e: MatchEvent) => e.isHome)}
                          />
                        ) : null,
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Away Team (Bottom) */}
              <div className="flex-1 flex flex-col justify-end py-4 space-y-6">
                {/* Away Formation Lines (reversed order) */}
                {[...awayLines].reverse().map((line, lineIndex) => (
                  <div key={lineIndex} className="flex justify-center">
                    <div className="flex justify-evenly w-full max-w-lg">
                      {line.map((player, playerIndex) =>
                        player ? (
                          <PlayerCard
                            key={player.name || playerIndex}
                            player={{
                              name: player.name,
                              number: player.number,
                            }}
                            position={player.position}
                            isHome={false}
                            events={matchEvents.filter((e: MatchEvent) => !e.isHome)}
                          />
                        ) : null,
                      )}
                    </div>
                  </div>
                ))}

                {/* Away Goalkeeper */}
                {awayGK && (
                  <div className="flex justify-center">
                    <PlayerCard
                      player={{
                        name: awayGK.name,
                        number: awayGK.number,
                      }}
                      position={awayGK.position}
                      isHome={false}
                      events={matchEvents.filter((e: MatchEvent) => !e.isHome)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <span className="font-medium">
              {match.awayTeam.name} ({lineups.awayTeam.formation})
            </span>
          </div>
        </div>
      </Card>

      {/* Substitutes */}
      {(lineups.homeTeam.substitutes?.length > 0 || lineups.awayTeam.substitutes?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Home Team Substitutes */}
          {lineups.homeTeam.substitutes && lineups.homeTeam.substitutes.length > 0 && (
            <Card>
              <div className="p-4">
                <h4 className="font-medium text-blue-600 mb-3">
                  {match.homeTeam.name} Substitutes
                </h4>
                <div className="flex flex-col gap-2">
                  {lineups.homeTeam.substitutes.map((player: any, index: number) => {
                    const playerEvents = matchEvents.filter(
                      (e: MatchEvent) =>
                        e.isHome &&
                        (e.playerName === player.name || e.assistPlayerName === player.name),
                    );
                    const wasSubbedIn = playerEvents.some(
                      (e: MatchEvent) => e.type === 'SUBSTITUTION' && e.detail?.includes('in'),
                    );

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1"
                      >
                        <div
                          className={`w-5 h-5 ${wasSubbedIn ? 'bg-green-600' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center text-xs font-medium`}
                        >
                          {player.number}
                        </div>
                        <div className="text-xs text-blue-800 flex-1">{player.name}</div>
                        <div className="flex gap-1">
                          {playerEvents.filter((e: MatchEvent) => e.type === 'GOAL').length > 0 && (
                            <span className="text-xs text-green-500">⚽</span>
                          )}
                          {playerEvents.some((e: MatchEvent) => e.type === 'YELLOW_CARD') && (
                            <span className="text-xs">🟨</span>
                          )}
                          {playerEvents.some((e: MatchEvent) => e.type === 'RED_CARD') && (
                            <span className="text-xs">🟥</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {lineups.homeTeam.coach && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Coach:{' '}
                    <span className="font-medium text-blue-600">
                      {typeof lineups.homeTeam.coach === 'object' && lineups.homeTeam.coach.name
                        ? lineups.homeTeam.coach.name
                        : typeof lineups.homeTeam.coach === 'string'
                          ? lineups.homeTeam.coach
                          : 'Unknown'}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Away Team Substitutes */}
          {lineups.awayTeam.substitutes && lineups.awayTeam.substitutes.length > 0 && (
            <Card>
              <div className="p-4">
                <h4 className="font-medium text-red-600 mb-3">{match.awayTeam.name} Substitutes</h4>
                <div className="flex flex-col gap-2">
                  {lineups.awayTeam.substitutes.map((player: any, index: number) => {
                    const playerEvents = matchEvents.filter(
                      (e: MatchEvent) =>
                        !e.isHome &&
                        (e.playerName === player.name || e.assistPlayerName === player.name),
                    );
                    const wasSubbedIn = playerEvents.some(
                      (e: MatchEvent) => e.type === 'SUBSTITUTION' && e.detail?.includes('in'),
                    );

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1"
                      >
                        <div
                          className={`w-5 h-5 ${wasSubbedIn ? 'bg-green-600' : 'bg-red-600'} text-white rounded-full flex items-center justify-center text-xs font-medium`}
                        >
                          {player.number}
                        </div>
                        <div className="text-xs text-red-800 flex-1">{player.name}</div>
                        <div className="flex gap-1">
                          {playerEvents.filter((e: MatchEvent) => e.type === 'GOAL').length > 0 && (
                            <span className="text-xs text-green-500">⚽</span>
                          )}
                          {playerEvents.some((e: MatchEvent) => e.type === 'YELLOW_CARD') && (
                            <span className="text-xs">🟨</span>
                          )}
                          {playerEvents.some((e: MatchEvent) => e.type === 'RED_CARD') && (
                            <span className="text-xs">🟥</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {lineups.awayTeam.coach && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Coach:{' '}
                    <span className="font-medium text-red-600">
                      {typeof lineups.awayTeam.coach === 'object' && lineups.awayTeam.coach.name
                        ? lineups.awayTeam.coach.name
                        : typeof lineups.awayTeam.coach === 'string'
                          ? lineups.awayTeam.coach
                          : 'Unknown'}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import Image from 'next/image';
import { Match } from '../types';

interface FixtureCardProps {
  match: Match;
}

export const FixtureCard: React.FC<FixtureCardProps> = ({ match }) => {
  const getMatchStatus = () => {
    if (match.isLive && match.minute) {
      return `${match.minute}'`;
    }

    if (match.isFinished) {
      return 'FT';
    }

    if (match.hasStarted) {
      return 'LIVE';
    }

    // Show kick-off time for upcoming matches
    if (match.startTime) {
      const startTime = new Date(match.startTime);
      return startTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }

    return match.status;
  };

  const getScoreDisplay = () => {
    if (match.isFinished || match.hasStarted) {
      const homeScore = match.homeScore ?? 0;
      const awayScore = match.awayScore ?? 0;

      // Show penalty scores if available
      if (match.homePenaltyScore !== null && match.awayPenaltyScore !== null) {
        return `${homeScore}-${awayScore} (${match.homePenaltyScore}-${match.awayPenaltyScore} pens)`;
      }

      return `${homeScore}-${awayScore}`;
    }

    return 'vs';
  };

  const getStatusColor = () => {
    if (match.isLive) return 'text-green-500';
    if (match.isFinished) return 'text-gray-500';
    return 'text-blue-500';
  };

  return (
    <div className="border border-border rounded-2xl p-1 hover:shadow-md transition-shadow">
      {/* Status Bar */}
      <div className="p-2 flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${match.isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}
        />
        <p className={`text-sm font-medium ${getStatusColor()}`}>{getMatchStatus()}</p>
        <span className="text-xs text-gray-500 ml-auto">
          {match.league.displayName || match.league.name}
        </span>
      </div>

      {/* Teams and Score */}
      <div className="bg-app-background rounded-xl p-4">
        <div className="space-y-3">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {match.homeTeam.logo && (
                <div className="w-6 h-6 relative flex-shrink-0">
                  <Image
                    src={match.homeTeam.logo}
                    alt={`${match.homeTeam.name} logo`}
                    width={24}
                    height={24}
                    className="object-contain"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
              )}
              <span className="font-medium text-sm truncate">{match.homeTeam.name}</span>
            </div>
            <span className="text-lg font-bold min-w-[20px] text-center">
              {match.isFinished || match.hasStarted ? (match.homeScore ?? 0) : ''}
            </span>
          </div>

          {/* Score Display */}
          {/* <div className="text-center">
            <span className="text-sm text-gray-600">{getScoreDisplay()}</span>
          </div> */}

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {match.awayTeam.logo && (
                <div className="w-6 h-6 relative flex-shrink-0">
                  <Image
                    src={match.awayTeam.logo}
                    alt={`${match.awayTeam.name} logo`}
                    width={24}
                    height={24}
                    className="object-contain"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
              )}
              <span className="font-medium text-sm truncate">{match.awayTeam.name}</span>
            </div>
            <span className="text-lg font-bold min-w-[20px] text-center">
              {match.isFinished || match.hasStarted ? (match.awayScore ?? 0) : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

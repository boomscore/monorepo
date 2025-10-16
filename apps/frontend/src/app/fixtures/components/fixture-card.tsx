import React from 'react';
import Image from 'next/image';
import { Match } from '../types';
import { cn } from '@/lib/utils';

interface FixtureCardProps {
  match: Match;
}

export const FixtureCard: React.FC<FixtureCardProps> = ({ match }) => {
  const homeTeam = match.homeTeam;
  const awayTeam = match.awayTeam;
  const homeScore = match.homeScore;
  const awayScore = match.awayScore;
  const isLive = match.isLive;
  const status = match.status;
  const isFinished = match.isFinished;
  const hasStarted = match.hasStarted;

  return (
    <div className="border border-border rounded-xl p-1">
      <div className="p-2 flex items-center gap-2">
        <span className={cn('w-1 h-4 rounded-sm', isLive ? 'bg-primary' : 'bg-app-background')} />
        <p className="">{status}</p>
      </div>

      <div className="bg-app-background rounded-xl p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {homeTeam.logo && (
                <div className="w-4 h-4 relative flex-shrink-0">
                  <Image
                    src={homeTeam.logo}
                    alt={`${homeTeam.name} logo`}
                    width={16}
                    height={16}
                    className="object-contain"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
              )}
              <span className="font-medium text-xs truncate">{match.homeTeam.name}</span>
            </div>
            <span className="text-xs font-medium min-w-[20px] text-center">
              {isFinished || hasStarted ? (homeScore ?? 0) : '-'}
            </span>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {awayTeam.logo && (
                <div className="w-4 h-4 relative flex-shrink-0">
                  <Image
                    src={awayTeam.logo}
                    alt={`${awayTeam.name} logo`}
                    width={16}
                    height={16}
                    className="object-contain"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
              )}
              <span className="font-medium text-xs truncate">{awayTeam.name}</span>
            </div>
            <span className="text-xs font-medium min-w-[20px] text-center">
              {isFinished || hasStarted ? (awayScore ?? 0) : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

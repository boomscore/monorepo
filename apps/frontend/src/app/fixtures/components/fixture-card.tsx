import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { GetGroupedFixturesQuery } from '@/gql/graphql';
import { MatchStatus } from '@/gql/graphql';
import Link from 'next/link';
import { format } from 'date-fns';

type Match = GetGroupedFixturesQuery['matchesGroupedByLeague']['groups'][0]['matches'][0];

interface FixtureCardProps {
  match: Match;
  showDate?: boolean; // When true, shows date/time instead of match status
}

export const FixtureCard: React.FC<FixtureCardProps> = ({ match, showDate = false }) => {
  const homeTeam = match.homeTeam;
  const awayTeam = match.awayTeam;
  const homeScore = match.homeScore ?? null;
  const awayScore = match.awayScore ?? null;
  const homePenaltyScore = match.homePenaltyScore ?? null;
  const awayPenaltyScore = match.awayPenaltyScore ?? null;
  const homeExtraTimeScore = match.homeExtraTimeScore ?? null;
  const awayExtraTimeScore = match.awayExtraTimeScore ?? null;
  const isLive = match.isLive;
  const status = match.status;
  const isFinished = match.isFinished;
  const hasStarted = match.hasStarted;
  const minute = match.minute;

  const hasPenalties = () => {
    return (
      homePenaltyScore !== null &&
      awayPenaltyScore !== null &&
      (homePenaltyScore! > 0 || awayPenaltyScore! > 0)
    );
  };

  const hasExtraTime = () => {
    return (
      homeExtraTimeScore !== null &&
      awayExtraTimeScore !== null &&
      (homeExtraTimeScore! > 0 || awayExtraTimeScore! > 0)
    );
  };

  const isActuallyFinished = () => {
    return (
      hasPenalties() ||
      hasExtraTime() ||
      isFinished ||
      status === MatchStatus.Finished ||
      (hasStarted &&
        homeScore !== null &&
        awayScore !== null &&
        (homeScore > 0 || awayScore > 0 || isFinished) &&
        !isLive &&
        status !== MatchStatus.Halftime)
    );
  };

  const getMatchStatus = () => {
    if (showDate && match.startTime) {
      const matchDate = new Date(match.startTime);
      return format(matchDate, 'dd MMM HH:mm');
    }

    if (hasPenalties()) {
      return 'FULL TIME (PEN)';
    }

    if (hasExtraTime()) {
      return 'FULL TIME (AET)';
    }

    if (isActuallyFinished()) {
      return 'FULL TIME';
    }

    if (isLive && minute) {
      return `LIVE (${minute}')`;
    }

    if (isLive && !minute) {
      return 'LIVE';
    }

    if (status === MatchStatus.Halftime) {
      return minute ? `HALF TIME (${minute}')` : 'HALF TIME';
    }

    if (status === MatchStatus.Scheduled || (!hasStarted && !isLive && !isFinished)) {
      if (match.startTime) {
        const startTime = new Date(match.startTime);
        const timeString = startTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        return `PLAYS TODAY AT ${timeString}`;
      }
      return 'SCHEDULED';
    }

    if (status === MatchStatus.Postponed) return 'POSTPONED';
    if (status === MatchStatus.Cancelled) return 'CANCELLED';
    if (status === MatchStatus.Suspended) return 'SUSPENDED';

    return status?.toUpperCase?.() || status;
  };

  const getWinner = () => {
    if (hasPenalties()) {
      if (homePenaltyScore! > awayPenaltyScore!) return 'home';
      if (awayPenaltyScore! > homePenaltyScore!) return 'away';
      return null;
    }

    if (!isActuallyFinished()) return null;

    const finalHomeScore = homeScore ?? 0;
    const finalAwayScore = awayScore ?? 0;

    if (finalHomeScore === finalAwayScore) return null;
    return finalHomeScore > finalAwayScore ? 'home' : 'away';
  };

  const winner = getWinner();
  const matchStatus = getMatchStatus();

  return (
    <Link
      href={`/fixtures/${match.id}`}
      className="outline-primary border border-border rounded-xl overflow-hidden p-1 text-text-grey cursor-pointer  block bg-background"
    >
      <div>
        <div className="p-2 flex items-center gap-2">
          <span className={cn('w-1 h-4 rounded-sm', isLive ? 'bg-primary' : 'bg-app-background')} />
          <p>{matchStatus}</p>
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
                <span className=" text-xs truncate">{homeTeam.name}</span>
              </div>
              <div className="flex gap-1 items-center min-w-[20px] justify-end">
                <span className={cn('text-xs', winner === 'home' && 'text-foreground')}>
                  {isActuallyFinished() || hasStarted || isLive ? (homeScore ?? 0) : '-'}
                </span>
                {hasPenalties() && (
                  <span className={cn('text-xs', winner === 'home' && 'text-foreground')}>
                    ({homePenaltyScore})
                  </span>
                )}
              </div>
            </div>

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
                <span className="text-xs truncate">{awayTeam.name}</span>
              </div>
              <div className="flex gap-1 items-center min-w-[20px] justify-end">
                <span className={cn('text-xs text-center', winner === 'away' && 'text-foreground')}>
                  {isActuallyFinished() || hasStarted || isLive ? (awayScore ?? 0) : '-'}
                </span>
                {hasPenalties() && (
                  <span
                    className={cn('text-xs text-center', winner === 'away' && 'text-foreground')}
                  >
                    ({awayPenaltyScore})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

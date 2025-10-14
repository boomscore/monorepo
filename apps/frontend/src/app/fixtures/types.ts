export interface Team {
  id: string;
  name: string;
  logo?: string;
}

export interface League {
  id: string;
  name: string;
  displayName?: string;
  logo?: string;
  country?: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
  homeHalfTimeScore?: number;
  awayHalfTimeScore?: number;
  homeExtraTimeScore?: number;
  awayExtraTimeScore?: number;
  status: string;
  isLive: boolean;
  isFinished: boolean;
  hasStarted: boolean;
  minute?: number;
  startTime?: string;
  finishedAt?: string;
  league: League;
  timeUntilStart?: string;
  result?: string;
}

export interface LeagueGroup {
  league: League;
  matches: Match[];
}


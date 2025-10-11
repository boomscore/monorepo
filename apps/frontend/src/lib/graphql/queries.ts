import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      firstName
      lastName
      fullName
      avatar
      phoneNumber
      country
      timezone
      preferredLanguage
      isActive
      isSubscribed
      role
      status
      createdAt
    }
  }
`;

export const GET_LEAGUES = gql`
  query GetLeagues($sportId: String, $country: String, $isActive: Boolean) {
    leagues(sportId: $sportId, country: $country, isActive: $isActive) {
      id
      name
      displayName
      fullName
      slug
      country
      countryCode
      countryFlag
      logo
      isActive
      isFeatured
      currentSeason
      totalMatches
      totalTeams
      sport {
        id
        name
        displayName
        slug
      }
    }
  }
`;

export const GET_MATCHES = gql`
  query GetMatches(
    $date: String
    $isLive: Boolean
    $isToday: Boolean
    $leagueId: String
    $teamId: String
    $limit: Float
    $offset: Float
  ) {
    matches(
      date: $date
      isLive: $isLive
      isToday: $isToday
      leagueId: $leagueId
      teamId: $teamId
      limit: $limit
      offset: $offset
    ) {
      id
      startTime
      status
      shortStatus
      hasStarted
      isFinished
      isLive
      isUpcoming
      isFeatured
      homeScore
      awayScore
      displayScore
      homeTeam {
        id
        name
        displayName
        shortName
        logo
      }
      awayTeam {
        id
        name
        displayName
        shortName
        logo
      }
      league {
        id
        name
        displayName
        logo
        country
      }
      timeUntilStart
      minute
      result
    }
  }
`;

export const GET_LIVE_MATCHES = gql`
  query GetLiveMatches {
    liveMatches {
      id
      startTime
      status
      shortStatus
      minute
      homeScore
      awayScore
      displayScore
      homeTeam {
        id
        name
        displayName
        logo
      }
      awayTeam {
        id
        name
        displayName
        logo
      }
      league {
        id
        name
        displayName
        logo
        country
      }
    }
  }
`;

export const GET_TODAYS_MATCHES = gql`
  query GetTodaysMatches {
    todaysMatches {
      id
      startTime
      status
      shortStatus
      hasStarted
      isFinished
      isLive
      homeScore
      awayScore
      displayScore
      homeTeam {
        id
        name
        displayName
        logo
      }
      awayTeam {
        id
        name
        displayName
        logo
      }
      league {
        id
        name
        displayName
        logo
      }
      timeUntilStart
    }
  }
`;

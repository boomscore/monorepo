/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetGroupedFixtures(\n    $date: String\n    $isLive: Boolean\n    $isToday: Boolean\n    $leagueId: String\n    $teamId: String\n    $limit: Float\n    $offset: Float\n  ) {\n    matchesGroupedByLeague(\n      date: $date\n      isLive: $isLive\n      isToday: $isToday\n      leagueId: $leagueId\n      teamId: $teamId\n      limit: $limit\n      offset: $offset\n    ) {\n      groups {\n        league {\n          id\n          name\n          displayName\n          logo\n          country\n        }\n        matches {\n          id\n          homeTeam {\n            name\n            logo\n            id\n          }\n          awayTeam {\n            name\n            logo\n            id\n          }\n          awayScore\n          awayPenaltyScore\n          awayHalfTimeScore\n          awayExtraTimeScore\n          finishedAt\n          hasStarted\n          homeExtraTimeScore\n          homeHalfTimeScore\n          homePenaltyScore\n          homeScore\n          isLive\n          isFinished\n          minute\n          status\n          startTime\n          league {\n            id\n            name\n            displayName\n            logo\n            country\n          }\n          timeUntilStart\n          result\n        }\n        totalMatches\n        hasLiveMatches\n        hasUpcomingMatches\n      }\n      totalMatches\n      totalGroups\n      hasMore\n    }\n  }\n": typeof types.GetGroupedFixturesDocument,
};
const documents: Documents = {
    "\n  query GetGroupedFixtures(\n    $date: String\n    $isLive: Boolean\n    $isToday: Boolean\n    $leagueId: String\n    $teamId: String\n    $limit: Float\n    $offset: Float\n  ) {\n    matchesGroupedByLeague(\n      date: $date\n      isLive: $isLive\n      isToday: $isToday\n      leagueId: $leagueId\n      teamId: $teamId\n      limit: $limit\n      offset: $offset\n    ) {\n      groups {\n        league {\n          id\n          name\n          displayName\n          logo\n          country\n        }\n        matches {\n          id\n          homeTeam {\n            name\n            logo\n            id\n          }\n          awayTeam {\n            name\n            logo\n            id\n          }\n          awayScore\n          awayPenaltyScore\n          awayHalfTimeScore\n          awayExtraTimeScore\n          finishedAt\n          hasStarted\n          homeExtraTimeScore\n          homeHalfTimeScore\n          homePenaltyScore\n          homeScore\n          isLive\n          isFinished\n          minute\n          status\n          startTime\n          league {\n            id\n            name\n            displayName\n            logo\n            country\n          }\n          timeUntilStart\n          result\n        }\n        totalMatches\n        hasLiveMatches\n        hasUpcomingMatches\n      }\n      totalMatches\n      totalGroups\n      hasMore\n    }\n  }\n": types.GetGroupedFixturesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetGroupedFixtures(\n    $date: String\n    $isLive: Boolean\n    $isToday: Boolean\n    $leagueId: String\n    $teamId: String\n    $limit: Float\n    $offset: Float\n  ) {\n    matchesGroupedByLeague(\n      date: $date\n      isLive: $isLive\n      isToday: $isToday\n      leagueId: $leagueId\n      teamId: $teamId\n      limit: $limit\n      offset: $offset\n    ) {\n      groups {\n        league {\n          id\n          name\n          displayName\n          logo\n          country\n        }\n        matches {\n          id\n          homeTeam {\n            name\n            logo\n            id\n          }\n          awayTeam {\n            name\n            logo\n            id\n          }\n          awayScore\n          awayPenaltyScore\n          awayHalfTimeScore\n          awayExtraTimeScore\n          finishedAt\n          hasStarted\n          homeExtraTimeScore\n          homeHalfTimeScore\n          homePenaltyScore\n          homeScore\n          isLive\n          isFinished\n          minute\n          status\n          startTime\n          league {\n            id\n            name\n            displayName\n            logo\n            country\n          }\n          timeUntilStart\n          result\n        }\n        totalMatches\n        hasLiveMatches\n        hasUpcomingMatches\n      }\n      totalMatches\n      totalGroups\n      hasMore\n    }\n  }\n"): typeof import('./graphql').GetGroupedFixturesDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

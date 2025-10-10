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
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      message\n      user {\n        id\n        username\n        email\n        firstName\n        lastName\n        fullName\n        avatar\n        role\n        isActive\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Register($input: CreateUserInput!) {\n    register(input: $input) {\n      accessToken\n      message\n      user {\n        id\n        username\n        email\n        firstName\n        lastName\n        fullName\n        avatar\n        role\n        isActive\n      }\n    }\n  }\n": typeof types.RegisterDocument,
    "\n  mutation Logout {\n    logout\n  }\n": typeof types.LogoutDocument,
    "\n  mutation UpdateProfile($input: UpdateUserInput!) {\n    updateProfile(input: $input) {\n      id\n      username\n      email\n      firstName\n      lastName\n      fullName\n      avatar\n      country\n      timezone\n      preferredLanguage\n      phoneNumber\n      dateOfBirth\n    }\n  }\n": typeof types.UpdateProfileDocument,
    "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input) {\n      id\n      email\n      username\n    }\n  }\n": typeof types.ChangePasswordDocument,
    "\n  mutation CreateConversation($input: CreateConversationInput!) {\n    createConversation(input: $input) {\n      id\n      title\n      displayTitle\n      description\n      systemPrompt\n      isActive\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateConversationDocument,
    "\n  mutation SendMessage($input: SendMessageInput!) {\n    sendMessage(input: $input) {\n      conversation {\n        id\n        displayTitle\n        lastMessageAt\n        messageCount\n      }\n      userMessage {\n        id\n        content\n        role\n        createdAt\n      }\n      assistantMessage {\n        id\n        content\n        role\n        responseTime\n        tokens\n        cost\n        createdAt\n      }\n    }\n  }\n": typeof types.SendMessageDocument,
    "\n  mutation GeneratePredictions($input: GeneratePredictionInput!) {\n    generatePredictions(input: $input) {\n      id\n      type\n      outcome\n      confidence\n      confidenceLevel\n      displayText\n      reasoning\n      details\n      odds\n      potentialWin\n      status\n      match {\n        id\n        startTime\n        homeTeam {\n          id\n          name\n          displayName\n          logo\n        }\n        awayTeam {\n          id\n          name\n          displayName\n          logo\n        }\n        league {\n          id\n          name\n          displayName\n        }\n      }\n      createdAt\n    }\n  }\n": typeof types.GeneratePredictionsDocument,
    "\n  query GetMe {\n    me {\n      id\n      username\n      email\n      firstName\n      lastName\n      fullName\n      avatar\n      phoneNumber\n      country\n      timezone\n      preferredLanguage\n      isActive\n      isSubscribed\n      role\n      status\n      createdAt\n    }\n  }\n": typeof types.GetMeDocument,
    "\n  query GetLeagues($sportId: String, $country: String, $isActive: Boolean) {\n    leagues(sportId: $sportId, country: $country, isActive: $isActive) {\n      id\n      name\n      displayName\n      fullName\n      slug\n      country\n      countryCode\n      countryFlag\n      logo\n      isActive\n      isFeatured\n      currentSeason\n      totalMatches\n      totalTeams\n      sport {\n        id\n        name\n        displayName\n        slug\n      }\n    }\n  }\n": typeof types.GetLeaguesDocument,
    "\n  query GetMatches(\n    $date: String\n    $isLive: Boolean\n    $isToday: Boolean\n    $leagueId: String\n    $teamId: String\n    $limit: Float\n    $offset: Float\n  ) {\n    matches(\n      date: $date\n      isLive: $isLive\n      isToday: $isToday\n      leagueId: $leagueId\n      teamId: $teamId\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      startTime\n      status\n      shortStatus\n      hasStarted\n      isFinished\n      isLive\n      isUpcoming\n      isFeatured\n      homeScore\n      awayScore\n      displayScore\n      homeTeam {\n        id\n        name\n        displayName\n        shortName\n        logo\n      }\n      awayTeam {\n        id\n        name\n        displayName\n        shortName\n        logo\n      }\n      league {\n        id\n        name\n        displayName\n        logo\n        country\n      }\n      timeUntilStart\n      minute\n      result\n    }\n  }\n": typeof types.GetMatchesDocument,
    "\n  query GetLiveMatches {\n    liveMatches {\n      id\n      startTime\n      status\n      shortStatus\n      minute\n      homeScore\n      awayScore\n      displayScore\n      homeTeam {\n        id\n        name\n        displayName\n        logo\n      }\n      awayTeam {\n        id\n        name\n        displayName\n        logo\n      }\n      league {\n        id\n        name\n        displayName\n        logo\n        country\n      }\n    }\n  }\n": typeof types.GetLiveMatchesDocument,
    "\n  query GetTodaysMatches {\n    todaysMatches {\n      id\n      startTime\n      status\n      shortStatus\n      hasStarted\n      isFinished\n      isLive\n      homeScore\n      awayScore\n      displayScore\n      homeTeam {\n        id\n        name\n        displayName\n        logo\n      }\n      awayTeam {\n        id\n        name\n        displayName\n        logo\n      }\n      league {\n        id\n        name\n        displayName\n        logo\n      }\n      timeUntilStart\n    }\n  }\n": typeof types.GetTodaysMatchesDocument,
};
const documents: Documents = {
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      message\n      user {\n        id\n        username\n        email\n        firstName\n        lastName\n        fullName\n        avatar\n        role\n        isActive\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Register($input: CreateUserInput!) {\n    register(input: $input) {\n      accessToken\n      message\n      user {\n        id\n        username\n        email\n        firstName\n        lastName\n        fullName\n        avatar\n        role\n        isActive\n      }\n    }\n  }\n": types.RegisterDocument,
    "\n  mutation Logout {\n    logout\n  }\n": types.LogoutDocument,
    "\n  mutation UpdateProfile($input: UpdateUserInput!) {\n    updateProfile(input: $input) {\n      id\n      username\n      email\n      firstName\n      lastName\n      fullName\n      avatar\n      country\n      timezone\n      preferredLanguage\n      phoneNumber\n      dateOfBirth\n    }\n  }\n": types.UpdateProfileDocument,
    "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input) {\n      id\n      email\n      username\n    }\n  }\n": types.ChangePasswordDocument,
    "\n  mutation CreateConversation($input: CreateConversationInput!) {\n    createConversation(input: $input) {\n      id\n      title\n      displayTitle\n      description\n      systemPrompt\n      isActive\n      createdAt\n      updatedAt\n    }\n  }\n": types.CreateConversationDocument,
    "\n  mutation SendMessage($input: SendMessageInput!) {\n    sendMessage(input: $input) {\n      conversation {\n        id\n        displayTitle\n        lastMessageAt\n        messageCount\n      }\n      userMessage {\n        id\n        content\n        role\n        createdAt\n      }\n      assistantMessage {\n        id\n        content\n        role\n        responseTime\n        tokens\n        cost\n        createdAt\n      }\n    }\n  }\n": types.SendMessageDocument,
    "\n  mutation GeneratePredictions($input: GeneratePredictionInput!) {\n    generatePredictions(input: $input) {\n      id\n      type\n      outcome\n      confidence\n      confidenceLevel\n      displayText\n      reasoning\n      details\n      odds\n      potentialWin\n      status\n      match {\n        id\n        startTime\n        homeTeam {\n          id\n          name\n          displayName\n          logo\n        }\n        awayTeam {\n          id\n          name\n          displayName\n          logo\n        }\n        league {\n          id\n          name\n          displayName\n        }\n      }\n      createdAt\n    }\n  }\n": types.GeneratePredictionsDocument,
    "\n  query GetMe {\n    me {\n      id\n      username\n      email\n      firstName\n      lastName\n      fullName\n      avatar\n      phoneNumber\n      country\n      timezone\n      preferredLanguage\n      isActive\n      isSubscribed\n      role\n      status\n      createdAt\n    }\n  }\n": types.GetMeDocument,
    "\n  query GetLeagues($sportId: String, $country: String, $isActive: Boolean) {\n    leagues(sportId: $sportId, country: $country, isActive: $isActive) {\n      id\n      name\n      displayName\n      fullName\n      slug\n      country\n      countryCode\n      countryFlag\n      logo\n      isActive\n      isFeatured\n      currentSeason\n      totalMatches\n      totalTeams\n      sport {\n        id\n        name\n        displayName\n        slug\n      }\n    }\n  }\n": types.GetLeaguesDocument,
    "\n  query GetMatches(\n    $date: String\n    $isLive: Boolean\n    $isToday: Boolean\n    $leagueId: String\n    $teamId: String\n    $limit: Float\n    $offset: Float\n  ) {\n    matches(\n      date: $date\n      isLive: $isLive\n      isToday: $isToday\n      leagueId: $leagueId\n      teamId: $teamId\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      startTime\n      status\n      shortStatus\n      hasStarted\n      isFinished\n      isLive\n      isUpcoming\n      isFeatured\n      homeScore\n      awayScore\n      displayScore\n      homeTeam {\n        id\n        name\n        displayName\n        shortName\n        logo\n      }\n      awayTeam {\n        id\n        name\n        displayName\n        shortName\n        logo\n      }\n      league {\n        id\n        name\n        displayName\n        logo\n        country\n      }\n      timeUntilStart\n      minute\n      result\n    }\n  }\n": types.GetMatchesDocument,
    "\n  query GetLiveMatches {\n    liveMatches {\n      id\n      startTime\n      status\n      shortStatus\n      minute\n      homeScore\n      awayScore\n      displayScore\n      homeTeam {\n        id\n        name\n        displayName\n        logo\n      }\n      awayTeam {\n        id\n        name\n        displayName\n        logo\n      }\n      league {\n        id\n        name\n        displayName\n        logo\n        country\n      }\n    }\n  }\n": types.GetLiveMatchesDocument,
    "\n  query GetTodaysMatches {\n    todaysMatches {\n      id\n      startTime\n      status\n      shortStatus\n      hasStarted\n      isFinished\n      isLive\n      homeScore\n      awayScore\n      displayScore\n      homeTeam {\n        id\n        name\n        displayName\n        logo\n      }\n      awayTeam {\n        id\n        name\n        displayName\n        logo\n      }\n      league {\n        id\n        name\n        displayName\n        logo\n      }\n      timeUntilStart\n    }\n  }\n": types.GetTodaysMatchesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      message\n      user {\n        id\n        username\n        email\n        firstName\n        lastName\n        fullName\n        avatar\n        role\n        isActive\n      }\n    }\n  }\n"): typeof import('./graphql').LoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Register($input: CreateUserInput!) {\n    register(input: $input) {\n      accessToken\n      message\n      user {\n        id\n        username\n        email\n        firstName\n        lastName\n        fullName\n        avatar\n        role\n        isActive\n      }\n    }\n  }\n"): typeof import('./graphql').RegisterDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    logout\n  }\n"): typeof import('./graphql').LogoutDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProfile($input: UpdateUserInput!) {\n    updateProfile(input: $input) {\n      id\n      username\n      email\n      firstName\n      lastName\n      fullName\n      avatar\n      country\n      timezone\n      preferredLanguage\n      phoneNumber\n      dateOfBirth\n    }\n  }\n"): typeof import('./graphql').UpdateProfileDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input) {\n      id\n      email\n      username\n    }\n  }\n"): typeof import('./graphql').ChangePasswordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateConversation($input: CreateConversationInput!) {\n    createConversation(input: $input) {\n      id\n      title\n      displayTitle\n      description\n      systemPrompt\n      isActive\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').CreateConversationDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SendMessage($input: SendMessageInput!) {\n    sendMessage(input: $input) {\n      conversation {\n        id\n        displayTitle\n        lastMessageAt\n        messageCount\n      }\n      userMessage {\n        id\n        content\n        role\n        createdAt\n      }\n      assistantMessage {\n        id\n        content\n        role\n        responseTime\n        tokens\n        cost\n        createdAt\n      }\n    }\n  }\n"): typeof import('./graphql').SendMessageDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation GeneratePredictions($input: GeneratePredictionInput!) {\n    generatePredictions(input: $input) {\n      id\n      type\n      outcome\n      confidence\n      confidenceLevel\n      displayText\n      reasoning\n      details\n      odds\n      potentialWin\n      status\n      match {\n        id\n        startTime\n        homeTeam {\n          id\n          name\n          displayName\n          logo\n        }\n        awayTeam {\n          id\n          name\n          displayName\n          logo\n        }\n        league {\n          id\n          name\n          displayName\n        }\n      }\n      createdAt\n    }\n  }\n"): typeof import('./graphql').GeneratePredictionsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMe {\n    me {\n      id\n      username\n      email\n      firstName\n      lastName\n      fullName\n      avatar\n      phoneNumber\n      country\n      timezone\n      preferredLanguage\n      isActive\n      isSubscribed\n      role\n      status\n      createdAt\n    }\n  }\n"): typeof import('./graphql').GetMeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetLeagues($sportId: String, $country: String, $isActive: Boolean) {\n    leagues(sportId: $sportId, country: $country, isActive: $isActive) {\n      id\n      name\n      displayName\n      fullName\n      slug\n      country\n      countryCode\n      countryFlag\n      logo\n      isActive\n      isFeatured\n      currentSeason\n      totalMatches\n      totalTeams\n      sport {\n        id\n        name\n        displayName\n        slug\n      }\n    }\n  }\n"): typeof import('./graphql').GetLeaguesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMatches(\n    $date: String\n    $isLive: Boolean\n    $isToday: Boolean\n    $leagueId: String\n    $teamId: String\n    $limit: Float\n    $offset: Float\n  ) {\n    matches(\n      date: $date\n      isLive: $isLive\n      isToday: $isToday\n      leagueId: $leagueId\n      teamId: $teamId\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      startTime\n      status\n      shortStatus\n      hasStarted\n      isFinished\n      isLive\n      isUpcoming\n      isFeatured\n      homeScore\n      awayScore\n      displayScore\n      homeTeam {\n        id\n        name\n        displayName\n        shortName\n        logo\n      }\n      awayTeam {\n        id\n        name\n        displayName\n        shortName\n        logo\n      }\n      league {\n        id\n        name\n        displayName\n        logo\n        country\n      }\n      timeUntilStart\n      minute\n      result\n    }\n  }\n"): typeof import('./graphql').GetMatchesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetLiveMatches {\n    liveMatches {\n      id\n      startTime\n      status\n      shortStatus\n      minute\n      homeScore\n      awayScore\n      displayScore\n      homeTeam {\n        id\n        name\n        displayName\n        logo\n      }\n      awayTeam {\n        id\n        name\n        displayName\n        logo\n      }\n      league {\n        id\n        name\n        displayName\n        logo\n        country\n      }\n    }\n  }\n"): typeof import('./graphql').GetLiveMatchesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetTodaysMatches {\n    todaysMatches {\n      id\n      startTime\n      status\n      shortStatus\n      hasStarted\n      isFinished\n      isLive\n      homeScore\n      awayScore\n      displayScore\n      homeTeam {\n        id\n        name\n        displayName\n        logo\n      }\n      awayTeam {\n        id\n        name\n        displayName\n        logo\n      }\n      league {\n        id\n        name\n        displayName\n        logo\n      }\n      timeUntilStart\n    }\n  }\n"): typeof import('./graphql').GetTodaysMatchesDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

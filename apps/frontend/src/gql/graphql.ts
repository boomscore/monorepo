/* eslint-disable */
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  accessToken: Scalars['String']['output'];
  message: Scalars['String']['output'];
  user: User;
};

export type BatchStatistics = {
  __typename?: 'BatchStatistics';
  averageConfidence: Scalars['Float']['output'];
  completedPredictions: Scalars['Float']['output'];
  estimatedCost: Scalars['Float']['output'];
  failedPredictions: Scalars['Float']['output'];
  processingTime: Scalars['Float']['output'];
  totalMatches: Scalars['Float']['output'];
};

/** Status of prediction batch processing */
export enum BatchStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Processing = 'PROCESSING'
}

/** Billing cycle for the subscription */
export enum BillingCycle {
  Monthly = 'MONTHLY',
  Quarterly = 'QUARTERLY',
  Yearly = 'YEARLY'
}

export type BulkPredictionFiltersInput = {
  dateFrom: Scalars['DateTime']['input'];
  dateTo: Scalars['DateTime']['input'];
  excludeStarted?: InputMaybe<Scalars['Boolean']['input']>;
  leagueIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ChangePasswordInput = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type ChatMessage = {
  __typename?: 'ChatMessage';
  characterCount: Scalars['Float']['output'];
  containsCode: Scalars['Boolean']['output'];
  containsLinks: Scalars['Boolean']['output'];
  content: Scalars['String']['output'];
  context?: Maybe<Scalars['JSON']['output']>;
  conversation: Conversation;
  cost?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  entities?: Maybe<Array<Scalars['String']['output']>>;
  estimatedReadingTime?: Maybe<Scalars['Float']['output']>;
  extractedUrls: Array<Scalars['String']['output']>;
  hasToolCalls: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  intent?: Maybe<Scalars['JSON']['output']>;
  isAssistant: Scalars['Boolean']['output'];
  isEdited: Scalars['Boolean']['output'];
  isSystem: Scalars['Boolean']['output'];
  isTool: Scalars['Boolean']['output'];
  isUser: Scalars['Boolean']['output'];
  mentionedMatches: Array<Scalars['String']['output']>;
  mentionedTeams: Array<Scalars['String']['output']>;
  primaryIntent?: Maybe<Scalars['String']['output']>;
  responseTime?: Maybe<Scalars['Int']['output']>;
  role: ChatMessageRole;
  sentimentLabel?: Maybe<Scalars['String']['output']>;
  sentimentScore?: Maybe<Scalars['Float']['output']>;
  tokens?: Maybe<Scalars['Int']['output']>;
  toolCalls?: Maybe<Scalars['JSON']['output']>;
  toolResults?: Maybe<Scalars['JSON']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  wordCount: Scalars['Float']['output'];
};

/** Role of the chat message sender */
export enum ChatMessageRole {
  Assistant = 'ASSISTANT',
  System = 'SYSTEM',
  Tool = 'TOOL',
  User = 'USER'
}

export type Conversation = {
  __typename?: 'Conversation';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  displayTitle: Scalars['String']['output'];
  duration: Scalars['Float']['output'];
  estimatedCost: Scalars['Float']['output'];
  estimatedCostUSD?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isPinned: Scalars['Boolean']['output'];
  isRecent: Scalars['Boolean']['output'];
  lastMessage?: Maybe<ChatMessage>;
  lastMessageAt?: Maybe<Scalars['DateTime']['output']>;
  messageCount: Scalars['Int']['output'];
  messages: Array<ChatMessage>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  systemPrompt?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  title?: Maybe<Scalars['String']['output']>;
  tokensUsed: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type CreateConversationInput = {
  systemPrompt?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CreateSubscriptionInput = {
  billingCycle: BillingCycle;
  plan: SubscriptionPlan;
};

export type CreateUserInput = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['DateTime']['input']>;
  email: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  preferredLanguage?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  username: Scalars['String']['input'];
};

export type GenerateBulkPredictionsInput = {
  filters: BulkPredictionFiltersInput;
  predictionTypes: Array<PredictionType>;
  scenario?: InputMaybe<Scalars['String']['input']>;
};

export type GeneratePredictionInput = {
  includeReasoning?: InputMaybe<Scalars['Boolean']['input']>;
  matchId: Scalars['String']['input'];
  predictionTypes: Array<PredictionType>;
  scenario?: InputMaybe<Scalars['String']['input']>;
};

export type GroupedMatchesResult = {
  __typename?: 'GroupedMatchesResult';
  groups: Array<LeagueGroup>;
  hasMore: Scalars['Boolean']['output'];
  totalGroups: Scalars['Int']['output'];
  totalMatches: Scalars['Int']['output'];
};

export type InitiatePaymentInput = {
  billingCycle: BillingCycle;
  plan: SubscriptionPlan;
};

export type League = {
  __typename?: 'League';
  country: Scalars['String']['output'];
  countryCode?: Maybe<Scalars['String']['output']>;
  countryFlag?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentSeason?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
  flag?: Maybe<Scalars['String']['output']>;
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isCurrentlyActive: Scalars['Boolean']['output'];
  isFeatured: Scalars['Boolean']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  seasonEnd?: Maybe<Scalars['DateTime']['output']>;
  seasonStart?: Maybe<Scalars['DateTime']['output']>;
  seasons: Array<Season>;
  slug: Scalars['String']['output'];
  sortOrder: Scalars['Float']['output'];
  sport: Sport;
  teams: Array<Team>;
  totalMatches: Scalars['Float']['output'];
  totalTeams: Scalars['Float']['output'];
  type: LeagueType;
  updatedAt: Scalars['DateTime']['output'];
};

export type LeagueGroup = {
  __typename?: 'LeagueGroup';
  hasLiveMatches: Scalars['Boolean']['output'];
  hasUpcomingMatches: Scalars['Boolean']['output'];
  league: League;
  matches: Array<Match>;
  totalMatches: Scalars['Int']['output'];
};

/** Type of league/competition */
export enum LeagueType {
  Cup = 'CUP',
  Friendly = 'FRIENDLY',
  League = 'LEAGUE',
  Playoffs = 'PLAYOFFS',
  Qualification = 'QUALIFICATION'
}

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Match = {
  __typename?: 'Match';
  attendance?: Maybe<Scalars['Int']['output']>;
  awayExtraTimeScore?: Maybe<Scalars['Int']['output']>;
  awayHalfTimeScore?: Maybe<Scalars['Int']['output']>;
  awayPenaltyScore?: Maybe<Scalars['Int']['output']>;
  awayScore?: Maybe<Scalars['Int']['output']>;
  awayTeam: Team;
  createdAt: Scalars['DateTime']['output'];
  displayScore: Scalars['String']['output'];
  events: Array<MatchEvent>;
  finishedAt?: Maybe<Scalars['DateTime']['output']>;
  hasStarted: Scalars['Boolean']['output'];
  homeExtraTimeScore?: Maybe<Scalars['Int']['output']>;
  homeHalfTimeScore?: Maybe<Scalars['Int']['output']>;
  homePenaltyScore?: Maybe<Scalars['Int']['output']>;
  homeScore?: Maybe<Scalars['Int']['output']>;
  homeTeam: Team;
  id: Scalars['ID']['output'];
  isFeatured: Scalars['Boolean']['output'];
  isFinished: Scalars['Boolean']['output'];
  isLive: Scalars['Boolean']['output'];
  isUpcoming: Scalars['Boolean']['output'];
  league: League;
  minute?: Maybe<Scalars['Int']['output']>;
  odds?: Maybe<Scalars['JSON']['output']>;
  period?: Maybe<Scalars['String']['output']>;
  referee?: Maybe<Scalars['String']['output']>;
  result: MatchResult;
  round?: Maybe<Scalars['Int']['output']>;
  roundName?: Maybe<Scalars['String']['output']>;
  season?: Maybe<Season>;
  shortStatus: Scalars['String']['output'];
  startTime: Scalars['DateTime']['output'];
  statistics?: Maybe<Scalars['JSON']['output']>;
  status: MatchStatus;
  timeUntilStart: Scalars['Float']['output'];
  totalGoals?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  venue?: Maybe<Scalars['String']['output']>;
  weather?: Maybe<Scalars['String']['output']>;
  winnerTeamId?: Maybe<Scalars['String']['output']>;
};

export type MatchEvent = {
  __typename?: 'MatchEvent';
  assistPlayer?: Maybe<Scalars['String']['output']>;
  assistPlayerName?: Maybe<Scalars['String']['output']>;
  coordinates?: Maybe<Scalars['JSON']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  detail?: Maybe<Scalars['String']['output']>;
  displayMinute: Scalars['String']['output'];
  displayText: Scalars['String']['output'];
  eventIcon: Scalars['String']['output'];
  extraTime?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isHome: Scalars['Boolean']['output'];
  isImportant: Scalars['Boolean']['output'];
  isScoring: Scalars['Boolean']['output'];
  match: Match;
  minute: Scalars['Int']['output'];
  player?: Maybe<Scalars['String']['output']>;
  playerIn?: Maybe<Scalars['String']['output']>;
  playerName?: Maybe<Scalars['String']['output']>;
  playerOut?: Maybe<Scalars['String']['output']>;
  team?: Maybe<Team>;
  type: MatchEventType;
  updatedAt: Scalars['DateTime']['output'];
};

/** Type of match event */
export enum MatchEventType {
  Corner = 'CORNER',
  ExtraTime = 'EXTRA_TIME',
  Foul = 'FOUL',
  FreeKick = 'FREE_KICK',
  Fulltime = 'FULLTIME',
  Goal = 'GOAL',
  Halftime = 'HALFTIME',
  Injury = 'INJURY',
  Kickoff = 'KICKOFF',
  MissedPenalty = 'MISSED_PENALTY',
  Offside = 'OFFSIDE',
  OwnGoal = 'OWN_GOAL',
  PenaltyGoal = 'PENALTY_GOAL',
  PenaltyShootout = 'PENALTY_SHOOTOUT',
  RedCard = 'RED_CARD',
  Substitution = 'SUBSTITUTION',
  Var = 'VAR',
  YellowCard = 'YELLOW_CARD'
}

/** Final result of the match */
export enum MatchResult {
  AwayWin = 'AWAY_WIN',
  Draw = 'DRAW',
  HomeWin = 'HOME_WIN',
  Pending = 'PENDING'
}

/** Current status of the match */
export enum MatchStatus {
  Abandoned = 'ABANDONED',
  Cancelled = 'CANCELLED',
  Finished = 'FINISHED',
  Halftime = 'HALFTIME',
  Live = 'LIVE',
  Postponed = 'POSTPONED',
  Scheduled = 'SCHEDULED',
  Suspended = 'SUSPENDED'
}

export type Mutation = {
  __typename?: 'Mutation';
  activateUser: User;
  banUser: User;
  cancelBatch: PredictionBatch;
  cancelSubscription: Subscription;
  changePassword: User;
  createConversation: Conversation;
  createSubscription: Subscription;
  debugInitializeSports: Scalars['String']['output'];
  deleteConversation: Scalars['Boolean']['output'];
  generateBulkPredictions: PredictionBatch;
  generatePredictions: Array<Prediction>;
  initiatePayment: PaymentResponse;
  login: AuthResponse;
  logout: Scalars['Boolean']['output'];
  register: AuthResponse;
  retryBatch: PredictionBatch;
  sendMessage: SendMessageResponse;
  suspendUser: User;
  updateConversation: Conversation;
  updatePreferences: User;
  updateProfile: User;
  verifyPayment: Payment;
};


export type MutationActivateUserArgs = {
  id: Scalars['String']['input'];
};


export type MutationBanUserArgs = {
  id: Scalars['String']['input'];
};


export type MutationCancelBatchArgs = {
  batchId: Scalars['String']['input'];
};


export type MutationCancelSubscriptionArgs = {
  subscriptionId: Scalars['String']['input'];
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationCreateConversationArgs = {
  input: CreateConversationInput;
};


export type MutationCreateSubscriptionArgs = {
  input: CreateSubscriptionInput;
};


export type MutationDeleteConversationArgs = {
  id: Scalars['String']['input'];
};


export type MutationGenerateBulkPredictionsArgs = {
  input: GenerateBulkPredictionsInput;
};


export type MutationGeneratePredictionsArgs = {
  input: GeneratePredictionInput;
};


export type MutationInitiatePaymentArgs = {
  input: InitiatePaymentInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationRegisterArgs = {
  input: CreateUserInput;
};


export type MutationRetryBatchArgs = {
  batchId: Scalars['String']['input'];
};


export type MutationSendMessageArgs = {
  input: SendMessageInput;
};


export type MutationSuspendUserArgs = {
  id: Scalars['String']['input'];
};


export type MutationUpdateConversationArgs = {
  id: Scalars['String']['input'];
  systemPrompt?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdatePreferencesArgs = {
  preferences: UserPreferencesInput;
};


export type MutationUpdateProfileArgs = {
  input: UpdateUserInput;
};


export type MutationVerifyPaymentArgs = {
  reference: Scalars['String']['input'];
};

export type Payment = {
  __typename?: 'Payment';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  displayAmount: Scalars['String']['output'];
  displayFees?: Maybe<Scalars['String']['output']>;
  displayNetAmount?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Float']['output']>;
  failedAt?: Maybe<Scalars['DateTime']['output']>;
  failureReason?: Maybe<Scalars['String']['output']>;
  fees?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  isFailed: Scalars['Boolean']['output'];
  isPending: Scalars['Boolean']['output'];
  isRefunded: Scalars['Boolean']['output'];
  isSuccess: Scalars['Boolean']['output'];
  method?: Maybe<PaymentMethod>;
  methodText?: Maybe<Scalars['String']['output']>;
  netAmount?: Maybe<Scalars['Float']['output']>;
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  paystackData?: Maybe<Scalars['JSON']['output']>;
  paystackReference: Scalars['String']['output'];
  refundedAmount?: Maybe<Scalars['Float']['output']>;
  refundedAt?: Maybe<Scalars['DateTime']['output']>;
  status: PaymentStatus;
  statusText: Scalars['String']['output'];
  subscription?: Maybe<Subscription>;
  type: PaymentType;
  typeText: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Method used for payment */
export enum PaymentMethod {
  BankTransfer = 'BANK_TRANSFER',
  Card = 'CARD',
  MobileMoney = 'MOBILE_MONEY',
  Qr = 'QR',
  Ussd = 'USSD'
}

export type PaymentResponse = {
  __typename?: 'PaymentResponse';
  payment: Payment;
  paymentUrl: Scalars['String']['output'];
  reference: Scalars['String']['output'];
};

/** Status of the payment */
export enum PaymentStatus {
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
  PartiallyRefunded = 'PARTIALLY_REFUNDED',
  Pending = 'PENDING',
  Refunded = 'REFUNDED',
  Success = 'SUCCESS'
}

/** Type of payment */
export enum PaymentType {
  Downgrade = 'DOWNGRADE',
  OneTime = 'ONE_TIME',
  Renewal = 'RENEWAL',
  Subscription = 'SUBSCRIPTION',
  Upgrade = 'UPGRADE'
}

export type Prediction = {
  __typename?: 'Prediction';
  actualOutcome?: Maybe<PredictionOutcome>;
  actualResult?: Maybe<Scalars['JSON']['output']>;
  actualWin?: Maybe<Scalars['Float']['output']>;
  batch?: Maybe<PredictionBatch>;
  confidence: Scalars['Float']['output'];
  confidenceLevel: Scalars['String']['output'];
  contextData?: Maybe<Scalars['JSON']['output']>;
  createdAt: Scalars['DateTime']['output'];
  details?: Maybe<Scalars['JSON']['output']>;
  displayText: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isCorrect?: Maybe<Scalars['Boolean']['output']>;
  isIncorrect: Scalars['Boolean']['output'];
  isPending: Scalars['Boolean']['output'];
  isResolved: Scalars['Boolean']['output'];
  match: Match;
  odds?: Maybe<Scalars['Float']['output']>;
  outcome: PredictionOutcome;
  potentialWin?: Maybe<Scalars['Float']['output']>;
  profitLoss?: Maybe<Scalars['Float']['output']>;
  reasoning?: Maybe<Scalars['String']['output']>;
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  scenario?: Maybe<Scalars['String']['output']>;
  stake?: Maybe<Scalars['Float']['output']>;
  status: PredictionStatus;
  type: PredictionType;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type PredictionAnalytics = {
  __typename?: 'PredictionAnalytics';
  accuracy: Scalars['Float']['output'];
  averageConfidence: Scalars['Float']['output'];
  byType: Array<PredictionTypeAnalytics>;
  correctPredictions: Scalars['Float']['output'];
  totalPredictions: Scalars['Float']['output'];
};

export type PredictionBatch = {
  __typename?: 'PredictionBatch';
  actualDuration?: Maybe<Scalars['Float']['output']>;
  averageConfidence?: Maybe<Scalars['Float']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  completionPercentage: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  estimatedCompletionAt?: Maybe<Scalars['DateTime']['output']>;
  estimatedTimeRemaining?: Maybe<Scalars['Float']['output']>;
  failedPredictions: Scalars['Int']['output'];
  filters: Scalars['JSON']['output'];
  id: Scalars['ID']['output'];
  isCompleted: Scalars['Boolean']['output'];
  isFailed: Scalars['Boolean']['output'];
  isPending: Scalars['Boolean']['output'];
  isProcessing: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  predictionTypes: Array<Scalars['String']['output']>;
  predictions: Array<Prediction>;
  processedMatches: Scalars['Int']['output'];
  progress?: Maybe<Scalars['JSON']['output']>;
  scenario?: Maybe<Scalars['String']['output']>;
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  status: BatchStatus;
  statusText: Scalars['String']['output'];
  successfulPredictions: Scalars['Int']['output'];
  summary?: Maybe<Scalars['JSON']['output']>;
  totalMatches: Scalars['Int']['output'];
  totalPredictions: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

/** Predicted outcome */
export enum PredictionOutcome {
  AwayWin = 'AWAY_WIN',
  Custom = 'CUSTOM',
  Draw = 'DRAW',
  Even = 'EVEN',
  HomeWin = 'HOME_WIN',
  No = 'NO',
  Odd = 'ODD',
  Over = 'OVER',
  Under = 'UNDER',
  Yes = 'YES'
}

/** Status of the prediction result */
export enum PredictionStatus {
  Correct = 'CORRECT',
  Finished = 'FINISHED',
  Incorrect = 'INCORRECT',
  Pending = 'PENDING',
  Push = 'PUSH',
  Void = 'VOID'
}

/** Type of prediction */
export enum PredictionType {
  BothTeamsScore = 'BOTH_TEAMS_SCORE',
  Cards = 'CARDS',
  CleanSheet = 'CLEAN_SHEET',
  Corners = 'CORNERS',
  CorrectScore = 'CORRECT_SCORE',
  DoubleChance = 'DOUBLE_CHANCE',
  DrawNoBet = 'DRAW_NO_BET',
  FirstGoalScorer = 'FIRST_GOAL_SCORER',
  GoalsOddEven = 'GOALS_ODD_EVEN',
  HalfTimeResult = 'HALF_TIME_RESULT',
  Handicap = 'HANDICAP',
  MatchWinner = 'MATCH_WINNER',
  OverUnder = 'OVER_UNDER',
  TeamTotalGoals = 'TEAM_TOTAL_GOALS',
  TotalGoals = 'TOTAL_GOALS',
  WinToNil = 'WIN_TO_NIL'
}

export type PredictionTypeAnalytics = {
  __typename?: 'PredictionTypeAnalytics';
  accuracy: Scalars['Float']['output'];
  correct: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
  type: PredictionType;
};

export type Query = {
  __typename?: 'Query';
  batchStatistics: BatchStatistics;
  conversation?: Maybe<Conversation>;
  conversations: Array<Conversation>;
  getConversation?: Maybe<Conversation>;
  isSubscriptionActive: Scalars['Boolean']['output'];
  league?: Maybe<League>;
  leagueBySlug?: Maybe<League>;
  leagueStandings?: Maybe<Scalars['JSON']['output']>;
  leagues: Array<League>;
  liveMatches: Array<Match>;
  match?: Maybe<Match>;
  matchEvents: Array<MatchEvent>;
  matchWithDetails?: Maybe<Match>;
  matches: Array<Match>;
  matchesGroupedByLeague: GroupedMatchesResult;
  me: User;
  myActiveSubscription?: Maybe<Subscription>;
  myConversations: Array<Conversation>;
  myPayments: Array<Payment>;
  mySubscriptions: Array<Subscription>;
  pastPredictions: Array<Prediction>;
  payment?: Maybe<Payment>;
  popularLeagues: Array<League>;
  prediction?: Maybe<Prediction>;
  predictionAnalytics: PredictionAnalytics;
  predictionBatch?: Maybe<PredictionBatch>;
  predictionBatches: Array<PredictionBatch>;
  predictions: Array<Prediction>;
  searchLeagues: Array<League>;
  searchTeams: Array<Team>;
  subscriptionLimits: Scalars['JSON']['output'];
  team?: Maybe<Team>;
  teamBySlug?: Maybe<Team>;
  teamWithDetails?: Maybe<Team>;
  teams: Array<Team>;
  testQuery: Scalars['String']['output'];
  todaysMatches: Array<Match>;
  user: User;
  users: Array<User>;
};


export type QueryBatchStatisticsArgs = {
  batchId: Scalars['String']['input'];
};


export type QueryConversationArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetConversationArgs = {
  id: Scalars['String']['input'];
};


export type QueryLeagueArgs = {
  id: Scalars['String']['input'];
};


export type QueryLeagueBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryLeagueStandingsArgs = {
  leagueId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Float']['input']>;
  season?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryLeaguesArgs = {
  country?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  sportId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMatchArgs = {
  id: Scalars['String']['input'];
};


export type QueryMatchEventsArgs = {
  matchId: Scalars['String']['input'];
};


export type QueryMatchWithDetailsArgs = {
  id: Scalars['String']['input'];
  includeEvents?: InputMaybe<Scalars['Boolean']['input']>;
  includeStatistics?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryMatchesArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
  isLive?: InputMaybe<Scalars['Boolean']['input']>;
  isToday?: InputMaybe<Scalars['Boolean']['input']>;
  leagueId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  teamId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMatchesGroupedByLeagueArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
  isLive?: InputMaybe<Scalars['Boolean']['input']>;
  isToday?: InputMaybe<Scalars['Boolean']['input']>;
  leagueId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  teamId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPastPredictionsArgs = {
  limit?: Scalars['Float']['input'];
};


export type QueryPaymentArgs = {
  id: Scalars['String']['input'];
};


export type QueryPredictionArgs = {
  id: Scalars['String']['input'];
};


export type QueryPredictionAnalyticsArgs = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryPredictionBatchArgs = {
  batchId: Scalars['String']['input'];
};


export type QueryPredictionsArgs = {
  matchId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySearchLeaguesArgs = {
  query: Scalars['String']['input'];
  sportId?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySearchTeamsArgs = {
  leagueId?: InputMaybe<Scalars['String']['input']>;
  query: Scalars['String']['input'];
};


export type QueryTeamArgs = {
  id: Scalars['String']['input'];
};


export type QueryTeamBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryTeamWithDetailsArgs = {
  id: Scalars['String']['input'];
  includeForm?: InputMaybe<Scalars['Boolean']['input']>;
  includeHomeAway?: InputMaybe<Scalars['Boolean']['input']>;
  includeStats?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryTeamsArgs = {
  country?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  leagueId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['String']['input'];
};


export type QueryUsersArgs = {
  limit?: Scalars['Float']['input'];
  page?: Scalars['Float']['input'];
};

export type Season = {
  __typename?: 'Season';
  createdAt: Scalars['DateTime']['output'];
  displayName: Scalars['String']['output'];
  endDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isCurrent: Scalars['Boolean']['output'];
  isFinished: Scalars['Boolean']['output'];
  league: League;
  name: Scalars['String']['output'];
  progress: Scalars['Float']['output'];
  standings?: Maybe<Scalars['JSON']['output']>;
  startDate: Scalars['DateTime']['output'];
  totalMatches: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  year: Scalars['Float']['output'];
};

export type SendMessageInput = {
  conversationId?: InputMaybe<Scalars['String']['input']>;
  customSystemPrompt?: InputMaybe<Scalars['String']['input']>;
  message: Scalars['String']['input'];
};

export type SendMessageResponse = {
  __typename?: 'SendMessageResponse';
  assistantMessage: ChatMessage;
  conversation: Conversation;
  userMessage: ChatMessage;
};

export type Sport = {
  __typename?: 'Sport';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  leagues: Array<League>;
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  sortOrder: Scalars['Float']['output'];
  totalLeagues: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  amount: Scalars['Float']['output'];
  autoRenew: Scalars['Boolean']['output'];
  billingCycle: BillingCycle;
  canUseFeature: Scalars['Boolean']['output'];
  cancellationReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  currentPeriodEnd?: Maybe<Scalars['DateTime']['output']>;
  currentPeriodStart?: Maybe<Scalars['DateTime']['output']>;
  daysUntilExpiry: Scalars['Float']['output'];
  daysUntilTrialEnd: Scalars['Float']['output'];
  displayName: Scalars['String']['output'];
  expiresAt: Scalars['DateTime']['output'];
  failedPaymentAttempts: Scalars['Float']['output'];
  features?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isCancelled: Scalars['Boolean']['output'];
  isExpired: Scalars['Boolean']['output'];
  isTrialing: Scalars['Boolean']['output'];
  lastFailedPaymentAt?: Maybe<Scalars['DateTime']['output']>;
  lastPaymentAt?: Maybe<Scalars['DateTime']['output']>;
  monthlyAmount: Scalars['Float']['output'];
  nextBillingAt?: Maybe<Scalars['DateTime']['output']>;
  payments: Array<Payment>;
  plan: SubscriptionPlan;
  startDate: Scalars['DateTime']['output'];
  status: SubscriptionStatus;
  trialEndsAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  usage?: Maybe<Scalars['JSON']['output']>;
  user: User;
};

/** Available subscription plans */
export enum SubscriptionPlan {
  Free = 'FREE',
  Pro = 'PRO',
  Ultra = 'ULTRA'
}

/** Status of the subscription */
export enum SubscriptionStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
  Pending = 'PENDING',
  Suspended = 'SUSPENDED',
  Trialing = 'TRIALING'
}

export type Team = {
  __typename?: 'Team';
  code?: Maybe<Scalars['String']['output']>;
  colors?: Maybe<Scalars['JSON']['output']>;
  country: Scalars['String']['output'];
  countryCode?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentForm?: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
  form?: Maybe<Scalars['JSON']['output']>;
  founded?: Maybe<Scalars['Float']['output']>;
  fullName: Scalars['String']['output'];
  goalDifference?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isHomeTeam: Scalars['Boolean']['output'];
  isNational: Scalars['Boolean']['output'];
  league: League;
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  shortName?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  statistics?: Maybe<Scalars['JSON']['output']>;
  totalMatches: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  venue?: Maybe<Scalars['String']['output']>;
  venueAddress?: Maybe<Scalars['String']['output']>;
  venueCapacity?: Maybe<Scalars['Float']['output']>;
  venueImage?: Maybe<Scalars['String']['output']>;
  winRate?: Maybe<Scalars['Float']['output']>;
};

export type UpdateUserInput = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['DateTime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  preferredLanguage?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<UserRole>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  dateOfBirth?: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isSubscribed: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  monthlyChatMessages: Scalars['Float']['output'];
  monthlyPredictions: Scalars['Float']['output'];
  phoneNumber?: Maybe<Scalars['String']['output']>;
  phoneVerified: Scalars['Boolean']['output'];
  preferredLanguage?: Maybe<Scalars['String']['output']>;
  role: UserRole;
  status: UserStatus;
  subscriptionActive: Scalars['Boolean']['output'];
  subscriptionExpiresAt?: Maybe<Scalars['DateTime']['output']>;
  subscriptionPlan: SubscriptionPlan;
  timezone?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type UserPreferencesInput = {
  language?: InputMaybe<Scalars['String']['input']>;
  theme?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

/** User role levels */
export enum UserRole {
  Admin = 'ADMIN',
  Moderator = 'MODERATOR',
  User = 'USER'
}

/** User account status */
export enum UserStatus {
  Active = 'ACTIVE',
  Banned = 'BANNED',
  Inactive = 'INACTIVE',
  Suspended = 'SUSPENDED'
}

export type GetGroupedFixturesQueryVariables = Exact<{
  date?: InputMaybe<Scalars['String']['input']>;
  isLive?: InputMaybe<Scalars['Boolean']['input']>;
  isToday?: InputMaybe<Scalars['Boolean']['input']>;
  leagueId?: InputMaybe<Scalars['String']['input']>;
  teamId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
}>;


export type GetGroupedFixturesQuery = { __typename?: 'Query', matchesGroupedByLeague: { __typename?: 'GroupedMatchesResult', totalMatches: number, totalGroups: number, hasMore: boolean, groups: Array<{ __typename?: 'LeagueGroup', totalMatches: number, hasLiveMatches: boolean, hasUpcomingMatches: boolean, league: { __typename?: 'League', id: string, name: string, displayName: string, logo?: string | null, country: string }, matches: Array<{ __typename?: 'Match', id: string, awayScore?: number | null, awayPenaltyScore?: number | null, awayHalfTimeScore?: number | null, awayExtraTimeScore?: number | null, finishedAt?: any | null, hasStarted: boolean, homeExtraTimeScore?: number | null, homeHalfTimeScore?: number | null, homePenaltyScore?: number | null, homeScore?: number | null, isLive: boolean, isFinished: boolean, minute?: number | null, status: MatchStatus, startTime: any, timeUntilStart: number, result: MatchResult, homeTeam: { __typename?: 'Team', name: string, logo?: string | null, id: string }, awayTeam: { __typename?: 'Team', name: string, logo?: string | null, id: string }, league: { __typename?: 'League', id: string, name: string, displayName: string, logo?: string | null, country: string } }> }> } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const GetGroupedFixturesDocument = new TypedDocumentString(`
    query GetGroupedFixtures($date: String, $isLive: Boolean, $isToday: Boolean, $leagueId: String, $teamId: String, $limit: Float, $offset: Float) {
  matchesGroupedByLeague(
    date: $date
    isLive: $isLive
    isToday: $isToday
    leagueId: $leagueId
    teamId: $teamId
    limit: $limit
    offset: $offset
  ) {
    groups {
      league {
        id
        name
        displayName
        logo
        country
      }
      matches {
        id
        homeTeam {
          name
          logo
          id
        }
        awayTeam {
          name
          logo
          id
        }
        awayScore
        awayPenaltyScore
        awayHalfTimeScore
        awayExtraTimeScore
        finishedAt
        hasStarted
        homeExtraTimeScore
        homeHalfTimeScore
        homePenaltyScore
        homeScore
        isLive
        isFinished
        minute
        status
        startTime
        league {
          id
          name
          displayName
          logo
          country
        }
        timeUntilStart
        result
      }
      totalMatches
      hasLiveMatches
      hasUpcomingMatches
    }
    totalMatches
    totalGroups
    hasMore
  }
}
    `) as unknown as TypedDocumentString<GetGroupedFixturesQuery, GetGroupedFixturesQueryVariables>;
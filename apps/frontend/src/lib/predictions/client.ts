import { gql } from '@apollo/client';
import { getClient } from '../apollo';

export enum PredictionType {
  MATCH_WINNER = 'MATCH_WINNER',
  BOTH_TEAMS_SCORE = 'BOTH_TEAMS_SCORE',
  OVER_UNDER = 'OVER_UNDER',
  HANDICAP = 'HANDICAP',
  CORRECT_SCORE = 'CORRECT_SCORE',
  FIRST_GOAL_SCORER = 'FIRST_GOAL_SCORER',
  TOTAL_GOALS = 'TOTAL_GOALS',
  HALF_TIME_RESULT = 'HALF_TIME_RESULT',
  DOUBLE_CHANCE = 'DOUBLE_CHANCE',
  DRAW_NO_BET = 'DRAW_NO_BET',
  CLEAN_SHEET = 'CLEAN_SHEET',
  WIN_TO_NIL = 'WIN_TO_NIL',
  GOALS_ODD_EVEN = 'GOALS_ODD_EVEN',
  TEAM_TOTAL_GOALS = 'TEAM_TOTAL_GOALS',
  CORNERS = 'CORNERS',
  CARDS = 'CARDS',
}

export enum PredictionOutcome {
  HOME_WIN = 'HOME_WIN',
  AWAY_WIN = 'AWAY_WIN',
  DRAW = 'DRAW',
  OVER = 'OVER',
  UNDER = 'UNDER',
  YES = 'YES',
  NO = 'NO',
  ODD = 'ODD',
  EVEN = 'EVEN',
  CUSTOM = 'CUSTOM',
}

export enum PredictionStatus {
  PENDING = 'PENDING',
  CORRECT = 'CORRECT',
  INCORRECT = 'INCORRECT',
  CANCELLED = 'CANCELLED',
  PUSH = 'PUSH',
}

export type Prediction = {
  id: string;
  type: PredictionType;
  outcome: PredictionOutcome;
  actualOutcome?: PredictionOutcome;
  status: PredictionStatus;
  confidence: number;
  odds?: number;
  reasoning?: string;
  scenario?: string;
  createdAt: string;
};

export type GeneratePredictionInput = {
  matchId: string;
  predictionTypes: PredictionType[];
  scenario?: string;
  includeReasoning?: boolean;
};

export const GENERATE_PREDICTIONS_MUTATION = gql`
  mutation GeneratePredictions($input: GeneratePredictionInput!) {
    generatePredictions(input: $input) {
      id
      type
      outcome
      status
      confidence
      odds
      reasoning
      scenario
      createdAt
    }
  }
`;

export const GET_PREDICTIONS_QUERY = gql`
  query GetPredictions($matchId: String) {
    predictions(matchId: $matchId) {
      id
      type
      outcome
      actualOutcome
      status
      confidence
      odds
      reasoning
      scenario
      createdAt
    }
  }
`;

export async function generatePredictions(input: GeneratePredictionInput): Promise<Prediction[]> {
  const client = getClient();
  const { data } = await client.mutate<{ generatePredictions: Prediction[] }>({
    mutation: GENERATE_PREDICTIONS_MUTATION,
    variables: { input },
  });
  if (!data?.generatePredictions) throw new Error('Failed to generate predictions');
  return data.generatePredictions;
}

export async function getPredictions(matchId?: string): Promise<Prediction[]> {
  const client = getClient();
  const { data } = await client.query<{ predictions: Prediction[] }>({
    query: GET_PREDICTIONS_QUERY,
    variables: { matchId },
    fetchPolicy: 'network-only',
  });
  return data.predictions || [];
}

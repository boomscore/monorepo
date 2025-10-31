'use client';

import { Badge, Button, Card } from '@/components';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { Loader2, Sparkles, TrendingUp, Target, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { GENERATE_PREDICTIONS_MUTATION, PredictionType } from '@/lib/predictions/client';
import { cn } from '@/lib/utils';

type Prediction = {
  id: string;
  type: string;
  outcome: string;
  confidence: number;
  reasoning?: string;
  odds?: number;
};

type LoadingStep = {
  id: number;
  label: string;
  duration: number;
};

// Simulated loading steps for better UX
// TODO: Replace with real progress tracking when backend supports it
const LOADING_STEPS: LoadingStep[] = [
  { id: 1, label: 'Fetching fixture data...', duration: 800 },
  { id: 2, label: 'Gathering head-to-head records...', duration: 1000 },
  { id: 3, label: 'Analyzing recent form...', duration: 1200 },
  { id: 4, label: 'Processing match statistics...', duration: 900 },
  { id: 5, label: 'Calculating standing impact...', duration: 1000 },
  { id: 6, label: 'Running AI analysis...', duration: 1500 },
  { id: 7, label: 'Generating predictions...', duration: 800 },
];

export const FixturePrediction = () => {
  const params = useParams();
  const matchId = params.id as string;
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const [generatePredictionsMutation, { loading }] = useMutation(GENERATE_PREDICTIONS_MUTATION, {
    onCompleted: data => {
      if (data?.generatePredictions) {
        setPredictions(data.generatePredictions);
        setCurrentStep(LOADING_STEPS.length);
        toast.success('Predictions generated successfully!');
      }
    },
    onError: error => {
      console.error('Failed to generate predictions:', error);
      toast.error('Failed to generate predictions. Please try again.');
      setCurrentStep(0);
    },
  });

  useEffect(() => {
    if (!loading) {
      setCurrentStep(0);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let stepIndex = 0;

    const progressThroughSteps = () => {
      if (stepIndex < LOADING_STEPS.length) {
        setCurrentStep(stepIndex + 1);
        timeoutId = setTimeout(() => {
          stepIndex++;
          progressThroughSteps();
        }, LOADING_STEPS[stepIndex].duration);
      }
    };

    progressThroughSteps();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);

  const handleGeneratePrediction = async () => {
    try {
      await generatePredictionsMutation({
        variables: {
          input: {
            matchId,
            predictionTypes: [
              PredictionType.MATCH_WINNER,
              PredictionType.BOTH_TEAMS_SCORE,
              PredictionType.OVER_UNDER,
            ],
            includeReasoning: true,
          },
        },
      });
    } catch (error) {
      console.error('Mutation error:', error);
    }
  };

  const getPredictionOutcomeLabel = (outcome: string) => {
    const labels: Record<string, string> = {
      HOME_WIN: 'Home Win',
      AWAY_WIN: 'Away Win',
      DRAW: 'Draw',
      YES: 'Yes',
      NO: 'No',
      OVER: 'Over 2.5',
      UNDER: 'Under 2.5',
    };
    return labels[outcome] || outcome;
  };

  const getPredictionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      MATCH_WINNER: 'Match Result',
      BOTH_TEAMS_SCORE: 'Both Teams to Score',
      OVER_UNDER: 'Over/Under Goals',
    };
    return labels[type] || type;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-base font-medium">AI prediction</p>
          <p className="text-sm text-text-grey">
            {predictions.length > 0
              ? 'AI predictions generated successfully'
              : 'Make a prediction for this match'}
          </p>
        </div>
        <Button className="bg-primary" onClick={handleGeneratePrediction} disabled={loading}>
          {loading ? 'Generating...' : 'Generate'}
        </Button>
      </div>

      {loading && (
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="space-y-2">
            {LOADING_STEPS.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              const isPending = currentStep < step.id;

              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center gap-2 transition-opacity duration-300',
                    isPending ? 'opacity-30' : 'opacity-50',
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span
                    className={cn(
                      'text-sm text-text-grey',
                      isCompleted ? 'line-through' : '',
                      isActive ? 'font-medium' : '',
                      isPending ? 'opacity-30' : '',
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {predictions.length > 0 && (
        <div className="space-y-3 pt-2">
          {predictions.map(prediction => (
            <Card key={prediction.id} variant="secondary" padding="sm" gap="sm">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-text-grey">{getPredictionTypeLabel(prediction.type)}</p>
                <Badge size="sm">
                  <span className="font-medium">
                    {Math.round(
                      prediction.confidence > 1
                        ? prediction.confidence
                        : prediction.confidence * 100,
                    )}
                    %
                  </span>
                  confidence
                </Badge>
              </div>
              <p className="text-base font-semibold">
                {getPredictionOutcomeLabel(prediction.outcome)}
              </p>

              {prediction.reasoning && (
                <p className="text-sm text-text-grey font-medium">{prediction.reasoning}</p>
              )}

              {prediction.odds && (
                <div className="flex items-center gap-2 text-xs text-text-grey">
                  <span>Estimated odds:</span>
                  <span className="font-medium text-foreground">{prediction.odds.toFixed(2)}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

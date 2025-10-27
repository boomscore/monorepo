import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, TrendingDown, Target } from 'lucide-react';

const predictions = [
  {
    id: 1,
    match: 'Manchester United vs Liverpool',
    prediction: 'Manchester United to win',
    odds: 2.1,
    stake: 50,
    status: 'won',
    result: 'W 2-1',
    date: '2023-10-15',
    payout: 105,
  },
  {
    id: 2,
    match: 'Arsenal vs Chelsea',
    prediction: 'Over 2.5 goals',
    odds: 1.8,
    stake: 25,
    status: 'lost',
    result: 'L 1-0',
    date: '2023-10-14',
    payout: 0,
  },
  {
    id: 3,
    match: 'Barcelona vs Real Madrid',
    prediction: 'Draw',
    odds: 3.2,
    stake: 30,
    status: 'pending',
    result: 'Pending',
    date: '2023-10-20',
    payout: 0,
  },
];

const PredictionHistoryPage = () => {
  const totalPredictions = predictions.length;
  const wonPredictions = predictions.filter(p => p.status === 'won').length;
  const winRate = totalPredictions > 0 ? ((wonPredictions / totalPredictions) * 100).toFixed(1) : 0;
  const totalStaked = predictions.reduce((sum, p) => sum + p.stake, 0);
  const totalPayout = predictions.reduce((sum, p) => sum + p.payout, 0);
  const profit = totalPayout - totalStaked;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prediction History</h1>
        <p className="text-muted-foreground mt-2">
          Track your prediction performance and analyze your betting patterns.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPredictions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStaked}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
            {profit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              ${profit >= 0 ? '+' : ''}
              {profit}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Predictions</CardTitle>
          <CardDescription>Your latest predictions and their outcomes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="won">Won</TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {predictions.map(prediction => (
                <div
                  key={prediction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{prediction.match}</p>
                    <p className="text-sm text-muted-foreground">
                      {prediction.prediction} @ {prediction.odds}
                    </p>
                    <p className="text-xs text-muted-foreground">{prediction.date}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge
                      variant={
                        prediction.status === 'won'
                          ? 'default'
                          : prediction.status === 'lost'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {prediction.status}
                    </Badge>
                    <p className="text-sm">Stake: ${prediction.stake}</p>
                    {prediction.payout > 0 && (
                      <p className="text-sm text-green-600">Payout: ${prediction.payout}</p>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="won" className="space-y-4">
              {predictions
                .filter(p => p.status === 'won')
                .map(prediction => (
                  <div
                    key={prediction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{prediction.match}</p>
                      <p className="text-sm text-muted-foreground">
                        {prediction.prediction} @ {prediction.odds}
                      </p>
                      <p className="text-xs text-muted-foreground">{prediction.date}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant="default">Won</Badge>
                      <p className="text-sm">Stake: ${prediction.stake}</p>
                      <p className="text-sm text-green-600">Payout: ${prediction.payout}</p>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="lost">
              {predictions
                .filter(p => p.status === 'lost')
                .map(prediction => (
                  <div
                    key={prediction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{prediction.match}</p>
                      <p className="text-sm text-muted-foreground">
                        {prediction.prediction} @ {prediction.odds}
                      </p>
                      <p className="text-xs text-muted-foreground">{prediction.date}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant="destructive">Lost</Badge>
                      <p className="text-sm">Stake: ${prediction.stake}</p>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="pending">
              {predictions
                .filter(p => p.status === 'pending')
                .map(prediction => (
                  <div
                    key={prediction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{prediction.match}</p>
                      <p className="text-sm text-muted-foreground">
                        {prediction.prediction} @ {prediction.odds}
                      </p>
                      <p className="text-xs text-muted-foreground">{prediction.date}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant="secondary">Pending</Badge>
                      <p className="text-sm">Stake: ${prediction.stake}</p>
                    </div>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionHistoryPage;

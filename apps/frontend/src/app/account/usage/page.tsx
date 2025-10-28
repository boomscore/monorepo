import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Calendar, Zap, Clock } from 'lucide-react';

const UsagePage = () => {
  const usageData = {
    predictions: { used: 245, limit: 500, percentage: 49 },
    aiInsights: { used: 89, limit: 200, percentage: 44.5 },
    liveUpdates: { used: 1240, limit: 2000, percentage: 62 },
    apiCalls: { used: 3400, limit: 5000, percentage: 68 },
  };

  const monthlyHistory = [
    { month: 'Jan', predictions: 420, insights: 180 },
    { month: 'Feb', predictions: 380, insights: 160 },
    { month: 'Mar', predictions: 450, insights: 195 },
    { month: 'Apr', predictions: 390, insights: 170 },
    { month: 'May', predictions: 480, insights: 200 },
    { month: 'Jun', predictions: 245, insights: 89 }, // Current month
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usage Overview</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your API usage, predictions, and subscription limits.
        </p>
      </div>

      {/* Current Month Usage */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Predictions Made</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {usageData.predictions.used} / {usageData.predictions.limit}
            </div>
            <p className="text-sm text-muted-foreground">
              {usageData.predictions.percentage}% of monthly limit used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">AI Insights</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {usageData.aiInsights.used} / {usageData.aiInsights.limit}
            </div>
            <p className="text-sm text-muted-foreground">
              {usageData.aiInsights.percentage}% of monthly limit used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Live Updates</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {usageData.liveUpdates.used} / {usageData.liveUpdates.limit}
            </div>
            <p className="text-sm text-muted-foreground">
              {usageData.liveUpdates.percentage}% of monthly limit used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">API Calls</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {usageData.apiCalls.used} / {usageData.apiCalls.limit}
            </div>
            <p className="text-sm text-muted-foreground">
              {usageData.apiCalls.percentage}% of monthly limit used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Alerts</CardTitle>
          <CardDescription>Important notifications about your usage limits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">API Calls - 68% Used</p>
              <p className="text-xs text-muted-foreground">
                You've used 3,400 of your 5,000 monthly API calls.
              </p>
            </div>
            <Badge variant="secondary">Warning</Badge>
          </div>

          <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Live Updates - 62% Used</p>
              <p className="text-xs text-muted-foreground">
                You've used 1,240 of your 2,000 monthly live updates.
              </p>
            </div>
            <Badge variant="secondary">Alert</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Usage History */}
      <Card>
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
          <CardDescription>Your usage patterns over the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyHistory.map((month, index) => (
              <div
                key={month.month}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium">{month.month} 2023</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Predictions: {month.predictions}</span>
                    <span>AI Insights: {month.insights}</span>
                  </div>
                </div>
                {index === monthlyHistory.length - 1 && (
                  <Badge variant="outline">Current Month</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Tips</CardTitle>
          <CardDescription>
            Optimize your usage and get the most out of your subscription.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Batch your predictions</p>
              <p className="text-xs text-muted-foreground">
                Group multiple predictions together to optimize your API usage.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Use caching wisely</p>
              <p className="text-xs text-muted-foreground">
                Enable caching for frequently accessed data to reduce API calls.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Upgrade for more capacity</p>
              <p className="text-xs text-muted-foreground">
                Consider upgrading your plan if you consistently hit your limits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsagePage;

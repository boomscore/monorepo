import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';

const SubscriptionPage = () => {
  const plans = [
    {
      name: 'Basic',
      price: 9.99,
      interval: 'month',
      description: 'Perfect for casual sports fans',
      features: [
        '100 predictions per month',
        'Basic AI insights',
        'Email support',
        'Mobile app access',
      ],
      current: false,
    },
    {
      name: 'Premium',
      price: 29.99,
      interval: 'month',
      description: 'Best for serious sports analysts',
      features: [
        '500 predictions per month',
        'Advanced AI insights',
        'Priority support',
        'Live data updates',
        'Custom analytics',
        'API access',
      ],
      current: true,
      popular: true,
    },
    {
      name: 'Professional',
      price: 99.99,
      interval: 'month',
      description: 'For professionals and teams',
      features: [
        'Unlimited predictions',
        'Premium AI insights',
        '24/7 phone support',
        'Real-time data',
        'Advanced analytics',
        'Full API access',
        'White-label options',
        'Team collaboration',
      ],
      current: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing preferences.
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Your Current Plan
          </CardTitle>
          <CardDescription>You are currently subscribed to the Premium plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Premium Plan</h3>
              <p className="text-sm text-muted-foreground">
                Billed monthly • Next payment: November 15, 2023
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">$29.99</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Manage Billing</Button>
            <Button variant="outline">Download Invoice</Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map(plan => (
            <Card key={plan.name} className={`relative ${plan.current ? 'border-primary' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.current ? 'secondary' : 'default'}
                  disabled={plan.current}
                >
                  {plan.current ? (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Current Plan
                    </>
                  ) : (
                    'Choose Plan'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle>Add-ons</CardTitle>
          <CardDescription>Enhance your subscription with additional features.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <h4 className="font-medium">Extra API Calls</h4>
                <p className="text-sm text-muted-foreground">
                  +1,000 additional API calls per month
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">$9.99/month</span>
              <Button variant="outline" size="sm">
                Add
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-blue-500" />
              <div>
                <h4 className="font-medium">Premium Support</h4>
                <p className="text-sm text-muted-foreground">
                  24/7 priority support with dedicated agent
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">$19.99/month</span>
              <Button variant="outline" size="sm">
                Add
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-purple-500" />
              <div>
                <h4 className="font-medium">White-label Access</h4>
                <p className="text-sm text-muted-foreground">
                  Remove branding and customize interface
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">$49.99/month</span>
              <Button variant="outline" size="sm">
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>Your payment method and billing details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-8 w-12 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Billing Address</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>John Doe</p>
                <p>1234 Main Street</p>
                <p>New York, NY 10001</p>
                <p>United States</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tax Information</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Tax ID: Not provided</p>
                <p>VAT: Not applicable</p>
              </div>
            </div>
          </div>

          <Button variant="outline">Update Billing Information</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPage;

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, CreditCard, Calendar, CheckCircle } from 'lucide-react';

const BillingPage = () => {
  const invoices = [
    {
      id: 'INV-001',
      date: '2023-10-15',
      amount: 29.99,
      status: 'paid',
      description: 'Premium Plan - October 2023',
      downloadUrl: '#',
    },
    {
      id: 'INV-002',
      date: '2023-09-15',
      amount: 29.99,
      status: 'paid',
      description: 'Premium Plan - September 2023',
      downloadUrl: '#',
    },
    {
      id: 'INV-003',
      date: '2023-08-15',
      amount: 29.99,
      status: 'paid',
      description: 'Premium Plan - August 2023',
      downloadUrl: '#',
    },
    {
      id: 'INV-004',
      date: '2023-07-15',
      amount: 9.99,
      status: 'paid',
      description: 'Basic Plan - July 2023',
      downloadUrl: '#',
    },
    {
      id: 'INV-005',
      date: '2023-06-15',
      amount: 9.99,
      status: 'paid',
      description: 'Basic Plan - June 2023',
      downloadUrl: '#',
    },
  ];

  const totalSpent = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const avgMonthly = totalSpent / invoices.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing History</h1>
        <p className="text-muted-foreground mt-2">
          View your payment history, manage billing methods, and download invoices.
        </p>
      </div>

      {/* Billing Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Since joining in June 2023</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Monthly</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgMonthly.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Based on {invoices.length} payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Up to Date</div>
            <p className="text-xs text-muted-foreground">Next payment: Nov 15, 2023</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Your current payment method and billing information.</CardDescription>
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Update
              </Button>
              <Button variant="outline" size="sm">
                Remove
              </Button>
            </div>
          </div>

          <Button variant="outline">
            <CreditCard className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
          <CardDescription>The address associated with your payment method.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Billing Address</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>John Doe</p>
                <p>1234 Main Street</p>
                <p>Apt 4B</p>
                <p>New York, NY 10001</p>
                <p>United States</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Tax Information</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Tax ID: Not provided</p>
                <p>VAT Number: N/A</p>
                <p>Tax Rate: 8.25%</p>
              </div>
            </div>
          </div>
          <Button variant="outline">Update Billing Address</Button>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>Download and view your past invoices and receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map(invoice => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{invoice.id}</p>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                      {invoice.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{invoice.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(invoice.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing {invoices.length} of {invoices.length} invoices
              </p>
            </div>
            <Button variant="outline">Download All Invoices</Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Preferences</CardTitle>
          <CardDescription>Configure your billing and invoice preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Invoice Email</label>
              <p className="text-sm text-muted-foreground">john.doe@example.com</p>
              <Button variant="outline" size="sm">
                Change Email
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <p className="text-sm text-muted-foreground">USD ($)</p>
              <Button variant="outline" size="sm">
                Change Currency
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive email notifications for new invoices and payment confirmations
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Payment Reminders</p>
                <p className="text-xs text-muted-foreground">
                  Get reminded 3 days before your payment is due
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Receipt Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive instant receipts after successful payments
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Billing */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Questions about your billing? We're here to help.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Billing Support</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Get help with payments, invoices, and billing questions.
              </p>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Refund Request</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Request a refund for your recent payment.
              </p>
              <Button variant="outline" size="sm">
                Request Refund
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingPage;

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const SupportPage = () => {
  const supportTickets = [
    {
      id: 'TICK-001',
      subject: 'Unable to access premium features',
      status: 'open',
      priority: 'high',
      created: '2023-10-14',
      lastUpdate: '2023-10-15',
      agent: 'Sarah Johnson',
    },
    {
      id: 'TICK-002',
      subject: 'Billing question about invoice',
      status: 'resolved',
      priority: 'medium',
      created: '2023-10-10',
      lastUpdate: '2023-10-12',
      agent: 'Mike Chen',
    },
    {
      id: 'TICK-003',
      subject: 'API rate limit exceeded',
      status: 'pending',
      priority: 'low',
      created: '2023-10-08',
      lastUpdate: '2023-10-09',
      agent: 'Emma Wilson',
    },
  ];

  const faqs = [
    {
      question: 'How do I upgrade my subscription plan?',
      answer:
        'You can upgrade your plan by going to the Subscription page in your account settings. Choose your desired plan and confirm the upgrade. The change will take effect immediately.',
    },
    {
      question: 'What happens if I exceed my API limits?',
      answer:
        'If you exceed your monthly API limits, your requests will be temporarily throttled. You can either wait for the next billing cycle or purchase additional API calls as an add-on.',
    },
    {
      question: 'How accurate are the sports predictions?',
      answer:
        'Our AI-powered predictions have an average accuracy rate of 75-80%. However, sports predictions are inherently uncertain, and past performance does not guarantee future results.',
    },
    {
      question: 'Can I cancel my subscription at any time?',
      answer:
        "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period, and you won't be charged for the next cycle.",
    },
    {
      question: 'Do you offer refunds?',
      answer:
        'We offer a 30-day money-back guarantee for new subscribers. For existing subscribers, refunds are considered on a case-by-case basis for unused portions of the service.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground mt-2">
          Get help, contact support, and find answers to common questions.
        </p>
      </div>

      <Tabs defaultValue="contact" className="space-y-6">
        <TabsList>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-6">
          {/* Contact Options */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>Chat with our support team in real-time</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">Available Mon-Fri, 9am-6pm EST</p>
                <Button className="w-full">Start Chat</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Mail className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <CardTitle>Email Support</CardTitle>
                <CardDescription>Send us a detailed message</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">Response within 24 hours</p>
                <Button variant="outline" className="w-full">
                  Send Email
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Phone className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <CardTitle>Phone Support</CardTitle>
                <CardDescription>Call us directly for urgent issues</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">Premium subscribers only</p>
                <Button variant="outline" className="w-full">
                  Call Now
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>
                Describe your issue and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Brief description of your issue" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select id="priority" className="w-full px-3 py-2 border rounded-md">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select id="category" className="w-full px-3 py-2 border rounded-md">
                  <option value="">Select a category</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="technical">Technical Issues</option>
                  <option value="account">Account Management</option>
                  <option value="api">API Support</option>
                  <option value="predictions">Predictions & Data</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Please provide as much detail as possible about your issue..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment">Attachments (optional)</Label>
                <Input id="attachment" type="file" multiple />
                <p className="text-xs text-muted-foreground">
                  Accepted formats: PDF, PNG, JPG, TXT. Max size: 10MB per file.
                </p>
              </div>

              <Button className="w-full">Send Message</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Track the status of your support requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportTickets.map(ticket => (
                  <div key={ticket.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{ticket.id}</h4>
                          <Badge
                            variant={
                              ticket.status === 'open'
                                ? 'default'
                                : ticket.status === 'resolved'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {ticket.status}
                          </Badge>
                          <Badge
                            variant={
                              ticket.priority === 'high'
                                ? 'destructive'
                                : ticket.priority === 'medium'
                                  ? 'default'
                                  : 'secondary'
                            }
                          >
                            {ticket.priority}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{ticket.subject}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Created: {new Date(ticket.created).toLocaleDateString()}</p>
                      <p>Last update: {new Date(ticket.lastUpdate).toLocaleDateString()}</p>
                      <p>Assigned to: {ticket.agent}</p>
                    </div>
                  </div>
                ))}
              </div>

              {supportTickets.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No support tickets found</p>
                  <Button className="mt-4">Create New Ticket</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <h4 className="font-medium mb-2">{faq.question}</h4>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Can't find what you're looking for?
                </p>
                <Button variant="outline">Contact Support</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentation
                </CardTitle>
                <CardDescription>Comprehensive guides and API documentation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Getting Started Guide
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  API Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Integration Examples
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Best Practices
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Status & Updates
                </CardTitle>
                <CardDescription>Service status and maintenance updates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">All Systems Operational</span>
                </div>
                <Button variant="outline" className="w-full justify-start">
                  System Status Page
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Maintenance Schedule
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Release Notes
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Community & Learning</CardTitle>
              <CardDescription>Connect with other users and expand your knowledge.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <MessageCircle className="h-6 w-6" />
                  <span>Community Forum</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Video Tutorials</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <HelpCircle className="h-6 w-6" />
                  <span>Webinars</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportPage;

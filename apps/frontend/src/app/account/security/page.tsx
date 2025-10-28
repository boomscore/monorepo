import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone, Key, AlertTriangle, CheckCircle } from 'lucide-react';

const SecurityPage = () => {
  const loginHistory = [
    {
      device: 'MacBook Pro',
      location: 'New York, NY',
      ip: '192.168.1.100',
      time: '2 hours ago',
      current: true,
    },
    {
      device: 'iPhone 14',
      location: 'New York, NY',
      ip: '192.168.1.101',
      time: '1 day ago',
      current: false,
    },
    {
      device: 'Chrome Browser',
      location: 'Boston, MA',
      ip: '10.0.0.50',
      time: '3 days ago',
      current: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Security</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account security settings and monitor access.
        </p>
      </div>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Security Status
          </CardTitle>
          <CardDescription>Your account security level and recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Account Secure</p>
                <p className="text-sm text-muted-foreground">
                  All security features are enabled and up to date.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Excellent
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">2FA Enabled</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Strong Password</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Verified Email</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password Settings
          </CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Password requirements:</p>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>At least 8 characters long</li>
              <li>Contains uppercase and lowercase letters</li>
              <li>Contains at least one number</li>
              <li>Contains at least one special character</li>
            </ul>
          </div>
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Authenticator App</p>
              <p className="text-sm text-muted-foreground">
                Use an authenticator app to generate verification codes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Enabled
              </Badge>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">SMS Authentication</p>
              <p className="text-sm text-muted-foreground">
                Receive verification codes via text message.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Disabled</Badge>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Backup Codes</p>
              <p className="text-sm text-muted-foreground">
                Generate backup codes in case you lose access to your device.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Generate Codes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Security Preferences</CardTitle>
          <CardDescription>Configure your security and privacy settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="login-notifications">Login Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone logs into your account.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="suspicious-activity">Suspicious Activity Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts for unusual account activity.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="session-timeout">Auto Session Timeout</Label>
              <p className="text-sm text-muted-foreground">
                Automatically log out after 30 minutes of inactivity.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="data-encryption">Enhanced Data Encryption</Label>
              <p className="text-sm text-muted-foreground">
                Use additional encryption for sensitive data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>Recent logins and device access to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loginHistory.map((login, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{login.device}</p>
                    {login.current && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Current Session
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {login.location} • {login.ip}
                  </p>
                  <p className="text-xs text-muted-foreground">{login.time}</p>
                </div>
                {!login.current && (
                  <Button variant="outline" size="sm">
                    Revoke Access
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Login History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Emergency Actions
          </CardTitle>
          <CardDescription>Take immediate action if your account is compromised.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Account Compromised?</h4>
            <p className="text-sm text-red-700 mb-3">
              If you suspect your account has been compromised, take immediate action.
            </p>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm">
                Log Out All Devices
              </Button>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Download Account Data</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Export all your account data and activity history.
            </p>
            <Button variant="outline" size="sm">
              Request Data Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPage;

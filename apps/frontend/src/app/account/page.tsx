import React from 'react';

const AccountPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Overview</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Profile Status</h3>
          <p className="text-sm text-muted-foreground">Your profile is complete and verified.</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Subscription</h3>
          <p className="text-sm text-muted-foreground">Active Premium Plan</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Usage This Month</h3>
          <p className="text-sm text-muted-foreground">245 predictions made</p>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;

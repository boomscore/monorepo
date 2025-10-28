import { Card, CardContent, CardHeader, CardTitle } from '@/components';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getServerCurrentUser } from '@/lib/auth/server';
import { ProfileForm } from './profile-form';
import { redirect } from 'next/navigation';
import { getInitials, getDisplayName } from '@/lib/utils';
import React from 'react';

const ProfilePage = async () => {
  const me = await getServerCurrentUser();

  if (!me?.user) {
    redirect('/account');
  }

  const user = me.user;
  const initials = getInitials(user);
  const displayName = getDisplayName(user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">This is your space, manage your info anytime.</p>
      </div>

      <Card variant="secondary" className="border-none">
        <div className="w-fit p-2 bg-background rounded-full translate-x-[30%]">
          <Avatar className="size-20">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
          </Avatar>
        </div>

        <Card className="pt-16 -mt-16">
          <CardHeader>
            <CardTitle>
              <h2 className="text-3xl font-semibold">{displayName}</h2>
              <p className="text-text-grey font-normal text-lg">{user.email}</p>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>
      </Card>
    </div>
  );
};

export default ProfilePage;

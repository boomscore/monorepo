'use client';

import React, { useState } from 'react';
import { Card, CardHeader, Tabs, TabsList, TabsTrigger, TabsContent, Button } from '../ui';
import Image from 'next/image';
import { SignUp } from './sign-up';
import { SignIn } from './sign-in';

type AuthBannerProps = {
  onCancel?: () => void;
  onSuccess?: () => void;
};

export const AuthBanner: React.FC<AuthBannerProps> = ({ onCancel, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [signInSuccess, setSignInSuccess] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleSignUpSuccess = () => {
    setSignUpSuccess(true);
    setActiveTab('signin');
  };

  const handleSignInSuccess = () => {
    setSignInSuccess(true);
    onSuccess?.();
  };

  return (
    <div className=" py-6 px-2 md:px-6 flex flex-col justify-center items-center">
      <Card padding="sm" className="w-full bg-background">
        <CardHeader>
          <div className="w-full">
            <Tabs
              defaultValue="signin"
              value={activeTab}
              onValueChange={value => {
                setActiveTab(value as 'signin' | 'signup');
              }}
            >
              <div className="flex justify-between">
                <TabsList shape="pill" size="lg" className="bg-background">
                  <TabsTrigger value="signup">Sign up</TabsTrigger>

                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                </TabsList>

                <div>
                  <Button
                    size="icon"
                    onClick={onCancel}
                    aria-label="Cancel authentication"
                    variant="ghost"
                    title="Cancel"
                  >
                    <Image src="/cancel.svg" alt="Cancel" width={40} height={40} />
                  </Button>
                </div>
              </div>

              <TabsContent value="signup" className="mt-4">
                <SignUp active={activeTab === 'signup'} onSuccess={handleSignUpSuccess} />
              </TabsContent>

              <TabsContent value="signin" className="mt-4">
                <SignIn active={activeTab === 'signin'} onSuccess={handleSignInSuccess} />
              </TabsContent>
            </Tabs>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

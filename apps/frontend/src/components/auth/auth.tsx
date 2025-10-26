'use client';

import React, { useState } from 'react';
import { Card, CardHeader, Tabs, TabsList, TabsTrigger, TabsContent, Button } from '../ui';
import Image from 'next/image';
import { SignUp } from './sign-up';
import { SignIn } from './sign-in';

type AuthBannerProps = {
  onCancel?: () => void;
};

export const AuthBanner: React.FC<AuthBannerProps> = ({ onCancel }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [signInSuccess, setSignInSuccess] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  return (
    <div className="min-h-screen py-6 px-2 md:px-6 flex flex-col justify-center items-center">
      <Card variant="primary" padding="sm" gap="lg" className="w-full bg-background">
        <CardHeader>
          <div className="w-full">
            <Tabs
              defaultValue="signin"
              onValueChange={value => {
                setActiveTab(value as 'signin' | 'signup');
              }}
            >
              <div className="flex justify-between">
                <TabsList
                  variant="default"
                  shape="pill"
                  size="lg"
                  className="inline-flex w-auto bg-white"
                >
                  <TabsTrigger value="signup" asChild>
                    <Button type="button"  className="bg-grey-950 text-primary ">
                      Sign up
                    </Button>
                  </TabsTrigger>

                  <TabsTrigger value="signin" asChild>
                    <Button type="button" className="bg-grey-950 text-primary ">Sign in</Button>
                  </TabsTrigger>
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
                <SignUp active={activeTab === 'signup'} onSuccess={() => setSignUpSuccess(true)} />
              </TabsContent>

              <TabsContent value="signin" className="mt-4">
                <SignIn active={activeTab === 'signin'} onSuccess={() => setSignInSuccess(true)} />
              </TabsContent>
            </Tabs>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

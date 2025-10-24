'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
} from '../ui';
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
      <Card
        variant="primary"
        padding="sm"
        gap="lg"
        className="w-full dark:bg-transparent lg:dark:bg-black md:dark:border shadow-lg"
      >
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
                    <Button type="button" className="inline-flex items-center px-4 py-2 ">
                      Sign up
                    </Button>
                  </TabsTrigger>

                  <TabsTrigger value="signin" asChild>
                    <Button type="button" className="inline-flex items-center px-4 py-2">
                      Sign in
                    </Button>
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
                {signUpSuccess ? (
                  <div className="p-4 rounded-md bg-brand-450 text-brand-900">
                    Account created — check your email for confirmation (simulated).
                  </div>
                ) : (
                  <SignUp
                    active={activeTab === 'signup'}
                    onSuccess={() => setSignUpSuccess(true)}
                  />
                )}
              </TabsContent>

              <TabsContent value="signin" className="mt-4">
                {signInSuccess ? (
                  <div className="p-4 rounded-md bg-brand-450 text-brand-900">
                    Signed in successfully (simulated).
                  </div>
                ) : (
                  <SignIn
                    active={activeTab === 'signin'}
                    onSuccess={() => setSignInSuccess(true)}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

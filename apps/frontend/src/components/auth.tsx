'use client';

import React, { useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Input,
} from './ui';
import Image from 'next/image';

type AuthBannerProps = {
  onCancel?: () => void;
};

export const AuthBanner: React.FC<AuthBannerProps> = ({ onCancel }) => {
  const [signInState, setSignInState] = useState<{ loading: boolean; success: boolean }>({
    loading: false,
    success: false,
  });
  const [signUpState, setSignUpState] = useState<{ loading: boolean; success: boolean }>({
    loading: false,
    success: false,
  });

  const signInEmailRef = useRef<HTMLInputElement | null>(null);
  const signUpNameRef = useRef<HTMLInputElement | null>(null);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignInState({ loading: true, success: false });
    await new Promise(res => setTimeout(res, 700));
    setSignInState({ loading: false, success: true });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignUpState({ loading: true, success: false });
    await new Promise(res => setTimeout(res, 900));
    setSignUpState({ loading: false, success: true });
  };

  return (
    <div className="min-h-screen py-6 px-2 md:px-6 flex flex-col justify-center items-center">
      <Card
        variant="primary"
        padding="sm"
        gap="lg"
        className="w-full dark:bg-transparent lg:dark:bg-black  md:dark:border "
      >
        <CardHeader>
          <div className="w-full ">
            <Tabs
              defaultValue="signin"
              onValueChange={value => {
                if (value === 'signup') {
                  setTimeout(() => signUpNameRef.current?.focus(), 0);
                } else {
                  setTimeout(() => signInEmailRef.current?.focus(), 0);
                }
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

                <div className="">
                  <Button
                    size="icon"
                    onClick={onCancel}
                    aria-label="Cancel authentication"
                    variant="ghost"
                    title="Cancel"
                  >
                    <Image src="/cancel.svg" alt="logo" width={40} height={40} />
                  </Button>
                </div>
              </div>

              <TabsContent value="signup" className="mt-4">
                {signUpState.success ? (
                  <div className="p-4 rounded-md bg-green-50 text-green-700">
                    Account created — check your email for confirmation (simulated).
                  </div>
                ) : (
                  <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-2xl">Create your account</h2>
                      <h3 className="text-sm text-grey-450">Let’s get you started</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        id="first-name"
                        name="first-name"
                        placeholder="First name"
                        ref={signUpNameRef}
                        required
                        className="rounded-2xl"
                        variant="lg"
                      />

                      <div>
                        <Input
                          id="last-name"
                          name="last-name"
                          placeholder="Last name"
                          ref={signUpNameRef}
                          required
                          className="rounded-2xl"
                          variant="lg"
                        />
                      </div>
                    </div>

                    <div>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        className="rounded-2xl"
                        variant="lg"
                      />
                    </div>

                    <div>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        minLength={8}
                        required
                        className="rounded-2xl"
                        variant="lg"
                      />
                    </div>

                    <div className="flex items-center justify-center mt-2 w-full">
                      <Button
                        type="submit"
                        size="lg"
                        className=" text-[#EAFAF4] bg-[#2bbb82] w-full"
                        disabled={signUpState.loading}
                      >
                        {signUpState.loading ? 'Creating...' : 'Create account'}
                      </Button>
                    </div>
                    <div>
                      <div className="flex justify-center items-center gap-2">
                        <hr className="my-4 border-t border-grey-950 w-[100px] md:w-[170px]" />
                        <h2 className="text-sm w-fit">Or </h2>
                        <hr className="my-4 border-t border-grey-950 w-[100px] md:w-[170px]" />
                      </div>
                      <div className="w-full">
                        <Button
                          type="submit"
                          size="lg"
                          className="flex gap-2 justify-center items-center w-full bg-grey-900 text-black"
                        >
                          <Image src="/google.svg" alt="google logo" width={24} height={24} />
                          <h2>Sign in with Google</h2>
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="signin" className="mt-4">
                {signInState.success ? (
                  <div className="p-4 rounded-md bg-green-50 text-green-700">
                    Signed in successfully (simulated).
                  </div>
                ) : (
                  <form onSubmit={handleSignIn} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-2xl">Welcome Back</h2>
                      <h3 className="text-sm text-grey-450">Sign in to your account</h3>
                    </div>
                    <div>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        ref={signInEmailRef}
                        required
                        className="rounded-2xl"
                        variant="lg"
                      />
                    </div>

                    <div>
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="rounded-2xl"
                        variant="lg"
                      />
                    </div>

                    <div className="flex items-center justify-center mt-2 w-full">
                      <Button
                        type="submit"
                        size="lg"
                        className=" text-[#EAFAF4] bg-[#2bbb82] w-full"
                        disabled={signInState.loading}
                      >
                        {signInState.loading ? 'Signing in...' : 'Sign in'}
                      </Button>
                    </div>
                    <div>
                      <div className="flex justify-center items-center gap-2">
                        <hr className="my-4 border-t border-grey-950 w-[100px] md:w-[170px]" />
                        <h2 className="text-sm w-fit">Or </h2>
                        <hr className="my-4 border-t border-grey-950 w-[100px] md:w-[170px]" />
                      </div>
                      <div className="w-full">
                        <Button
                          type="submit"
                          size="lg"
                          className="flex gap-2 justify-center items-center w-full bg-grey-900 text-black"
                        >
                          <Image src="/google.svg" alt="google logo" width={24} height={24} />
                          <h2>Sign in with Google</h2>
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm text-muted-foreground">
                        <a href="#" className="underline">
                          Forgot?
                        </a>
                      </div>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

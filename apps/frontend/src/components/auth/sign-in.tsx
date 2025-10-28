'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Button,
  Separator,
} from '../ui';
import Image from 'next/image';

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        email
        id
      }
      accessToken
    }
  }
`;

type SignInValues = {
  email: string;
  password: string;
};

type Props = {
  active?: boolean;
  onSuccess?: () => void;
};

export const SignIn: React.FC<Props> = ({ active, onSuccess }) => {
  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  const form = useForm<SignInValues>({
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (active) {
      form.setFocus('email');
    }
  }, [active]);

  const onSubmit = form.handleSubmit(async values => {
    try {
      const { data } = await login({
        variables: {
          input: {
            email: values.email,
            password: values.password,
          },
        },
      });

      if (data?.login?.accessToken) {
        localStorage.setItem('accessToken', data.login.accessToken);
        toast.success('Login successful!', {
          description: `Welcome back, ${data.login.user.email}`,
        });
        onSuccess?.();
      }
    } catch (err: any) {
      toast.error('Login failed', {
        description: err?.message || 'Invalid email or password',
      });
    }
  });

  const isSubmitting = loading || form.formState.isSubmitting;
  const submitLabel = isSubmitting ? 'Signing in...' : 'Sign in';

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl">Welcome Back</h2>
          <h3 className="text-sm text-grey-450">Sign in to your account</h3>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Email</FormLabel>
              <FormControl>
                <Input id="signin-email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Password</FormLabel>
              <FormControl>
                <Input id="signin-password" type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-center mt-2 w-full">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-center items-center gap-2 overflow-hidden">
            <Separator orientation="horizontal" />
            <h2 className="text-sm w-fit">Or </h2>
            <Separator orientation="horizontal" />
          </div>
          <div className="w-full">
            <Button type="button" variant="foreground" className=" w-full ">
              <Image src="/google.svg" alt="google logo" width={24} height={24} />
              Sign in with Google
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

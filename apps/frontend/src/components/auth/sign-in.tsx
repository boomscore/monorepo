'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { signInWithEmailPassword, type SignInInput } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

type SignInValues = SignInInput;

type Props = {
  active?: boolean;
  onSuccess?: () => void;
};

export const SignIn: React.FC<Props> = ({ active, onSuccess }) => {
  const router = useRouter();
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
      const result = await signInWithEmailPassword(values);
      toast.success('Login successful!', {
        description: `Welcome back, ${result.user.email}`,
      });
      router.refresh();
      onSuccess?.();
    } catch (err) {
      const description = (err as Error).message;
      toast.error('Login failed', { description });
    }
  });

  const isSubmitting = form.formState.isSubmitting;
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
            <Button
              type="button"
              variant="foreground"
              className=" w-full "
              onClick={() => {
                window.location.href = '/auth/google';
              }}
            >
              <Image src="/google.svg" alt="google logo" width={24} height={24} />
              Sign in with Google
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

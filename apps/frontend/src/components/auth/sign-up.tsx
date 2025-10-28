'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
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
import { toast } from 'sonner';
import { registerWithEmailPassword, type SignUpInput } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().regex(emailRegex, { message: 'Please enter a valid email' }),
  password: z
    .string()
    .min(8, 'Min 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must include uppercase, lowercase, number and special character',
    ),
});

type SignUpValues = z.infer<typeof signUpSchema> & SignUpInput;

type Props = {
  active?: boolean;
  onSuccess?: () => void;
};

export const SignUp: React.FC<Props> = ({ active, onSuccess }) => {
  const router = useRouter();
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: '', lastName: '', username: '', email: '', password: '' },
  });

  useEffect(() => {
    if (active) {
      form.setFocus('firstName');
    }
  }, [active]);

  const onSubmit = form.handleSubmit(async values => {
    try {
      await registerWithEmailPassword({
        email: values.email,
        username: values.username,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      toast.success('Welcome to Boomscore!', {
        description: `Account created successfully!`,
      });
      router.refresh();
      onSuccess?.();
    } catch (err: unknown) {
      const description = err instanceof Error ? err.message : 'Unable to create account';
      toast.error('Registration failed', { description });
    }
  });

  const { isSubmitting } = form.formState;
  const submitLabel = isSubmitting ? 'Signing up...' : 'Sign up';

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl">Create your account</h2>
          <h3 className="text-sm text-grey-450">Let’s get you started</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">First name</FormLabel>
                <FormControl>
                  <Input id="first-name" placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Last name</FormLabel>
                <FormControl>
                  <Input id="last-name" placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Email</FormLabel>
                <FormControl>
                  <Input id="signup-email" type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Username</FormLabel>
                <FormControl>
                  <Input id="signup-username" placeholder="Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Password</FormLabel>
              <FormControl>
                <Input id="signup-password" type="password" placeholder="••••••••" {...field} />
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

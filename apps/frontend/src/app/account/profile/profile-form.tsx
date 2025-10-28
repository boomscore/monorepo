'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Button,
} from '@/components/ui';
import { updateProfile, type AuthUser, type UpdateProfileInput } from '@/lib/auth/client';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type Props = {
  user: AuthUser;
};

export const ProfileForm: React.FC<Props> = ({ user }) => {
  const router = useRouter();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
    },
  });

  const onSubmit = form.handleSubmit(async values => {
    try {
      const input: UpdateProfileInput = {};

      if (values.firstName !== user.firstName) {
        input.firstName = values.firstName;
      }
      if (values.lastName !== user.lastName) {
        input.lastName = values.lastName;
      }

      if (Object.keys(input).length === 0) {
        toast.info('No changes to save');
        return;
      }

      await updateProfile(input);
      toast.success('Profile updated successfully!');
      router.refresh();
    } catch (err) {
      const message = (err as Error).message;
      toast.error('Update failed', { description: message });
    }
  });

  const { isSubmitting, isDirty } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your first name" {...field} />
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
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

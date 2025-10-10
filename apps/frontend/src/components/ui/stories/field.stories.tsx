import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '../field';
import { Input } from '../input';
import { Button } from '../button';

const meta: Meta<typeof Field> = {
  title: 'Components/ui/Field',
  component: Field,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: { type: 'radio' }, options: ['vertical', 'horizontal', 'responsive'] },
  },
};

export default meta;

type Story = StoryObj<typeof Field>;

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: args => (
    <Field {...args} style={{ width: 420 }}>
      <FieldLabel>
        <FieldTitle>First name</FieldTitle>
      </FieldLabel>
      <FieldContent>
        <Input placeholder="Enter first name" />
        <FieldDescription>This is the name you go by.</FieldDescription>
      </FieldContent>
    </Field>
  ),
};

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: args => (
    <Field {...args} style={{ width: 640 }}>
      <FieldLabel>
        <FieldTitle>Email</FieldTitle>
      </FieldLabel>
      <FieldContent>
        <Input placeholder="you@example.com" />
        <FieldDescription>Your primary contact email.</FieldDescription>
      </FieldContent>
    </Field>
  ),
};

export const WithError: Story = {
  render: args => (
    <Field {...args} style={{ width: 420 }}>
      <FieldLabel>
        <FieldTitle>Password</FieldTitle>
      </FieldLabel>
      <FieldContent>
        <Input placeholder="••••••••" type="password" aria-invalid="true" />
        <FieldError errors={[{ message: 'Password must be at least 8 characters' }]} />
      </FieldContent>
    </Field>
  ),
};

export const Grouped: Story = {
  render: args => (
    <FieldSet>
      <FieldLegend>Preferences</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel>
            <FieldTitle>Notifications</FieldTitle>
          </FieldLabel>
          <FieldContent>
            <Input placeholder="Email, push..." />
            <FieldDescription>How do you want to get updates?</FieldDescription>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel>
            <FieldTitle>Timezone</FieldTitle>
          </FieldLabel>
          <FieldContent>
            <Input placeholder="UTC" />
          </FieldContent>
        </Field>
      </FieldGroup>
      <FieldSeparator>
        <Button size="sm">Save</Button>
      </FieldSeparator>
    </FieldSet>
  ),
};

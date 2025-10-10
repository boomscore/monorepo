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
    orientation: {
      control: { type: 'radio' },
      options: ['vertical', 'horizontal', 'responsive'],
      description: 'Layout orientation for the field',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `A flexible Field component for form inputs, labels, descriptions, errors, and grouping.

### Usage

\`\`\`tsx
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
  FieldTitle
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

<Field orientation="vertical">
  <FieldLabel>
    <FieldTitle>First name</FieldTitle>
  </FieldLabel>
  <FieldContent>
    <Input placeholder="Enter first name" />
    <FieldDescription>This is the name you go by.</FieldDescription>
  </FieldContent>
</Field>
\`\`\`

Supports vertical, horizontal and grouped layouts. See stories below for more examples.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Field>;

/** Vertical field layout */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: args => (
    <Field {...args} className="max-w-md">
      <FieldLabel>
        <FieldTitle>First name</FieldTitle>
      </FieldLabel>
      <FieldContent>
        <Input placeholder="Enter first name" />
        <FieldDescription>This is the name you go by.</FieldDescription>
      </FieldContent>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Vertical field layout for standard forms.',
      },
    },
  },
};

/** Horizontal field layout */
export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: args => (
    <Field {...args} className="max-w-xl">
      <FieldLabel>
        <FieldTitle>Email</FieldTitle>
      </FieldLabel>
      <FieldContent>
        <Input placeholder="you@example.com" />
        <FieldDescription>Your primary contact email.</FieldDescription>
      </FieldContent>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Horizontal field layout, ideal for wide forms.',
      },
    },
  },
};

/** Field with validation error */
export const WithError: Story = {
  render: args => (
    <Field {...args} className="max-w-md">
      <FieldLabel>
        <FieldTitle>Password</FieldTitle>
      </FieldLabel>
      <FieldContent>
        <Input placeholder="••••••••" type="password" aria-invalid="true" />
        <FieldError errors={[{ message: 'Password must be at least 8 characters' }]} />
      </FieldContent>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Field with validation error message.',
      },
    },
  },
};

/** Grouped fields in a fieldset, with legend and separator */
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
  parameters: {
    docs: {
      description: {
        story: 'Grouped fields in a fieldset, with legend and separator.',
      },
    },
  },
};
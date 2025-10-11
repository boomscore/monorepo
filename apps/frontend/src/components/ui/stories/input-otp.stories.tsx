import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '../input-otp';

const meta: Meta<typeof InputOTP> = {
  title: 'Components/ui/InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text', description: 'Current OTP value' },
    maxLength: { control: 'number', description: 'Number of OTP slots' },
    disabled: { control: 'boolean', description: 'Disable the OTP input' },
    autoFocus: { control: 'boolean', description: 'Auto-focus the OTP input' },
    containerClassName: { control: 'text', description: 'Custom class for the container' },
  },
  parameters: {
    docs: {
      description: {
        component: `InputOTP is a multi-slot input designed for One-Time Passwords (OTP).

### Usage

\`\`\`tsx
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';

// Simple 6-digit OTP
<InputOTP maxLength={6} />

// Grouped 4-digit OTP with separator
<InputOTPGroup>
  <InputOTP maxLength={2} />
  <InputOTPSeparator />
  <InputOTP maxLength={2} />
</InputOTPGroup>

// Disabled OTP input
<InputOTP maxLength={6} disabled />

// Autofocus OTP input
<InputOTP maxLength={6} autoFocus />
\`\`\`

See stories below for more examples and props.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof InputOTP>;

/** Default 6-digit OTP input */
export const Default: Story = {
  render: args => <InputOTP {...args} maxLength={6} />,
  parameters: {
    docs: {
      description: {
        story: 'Default 6-digit OTP input.',
      },
    },
  },
};

/** Four digits grouped with a separator */
export const FourWithSeparator: Story = {
  render: args => (
    <InputOTPGroup>
      <InputOTP {...args} maxLength={2} />
      <InputOTPSeparator className="mx-2" />
      <InputOTP {...args} maxLength={2} />
    </InputOTPGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Two groups of 2 digits, separated visually.',
      },
    },
  },
};

/** Disabled OTP input */
export const Disabled: Story = {
  render: args => (
    <InputOTP
      {...args}
      containerClassName="opacity-50"
      maxLength={6}
      disabled
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'OTP input in disabled state.',
      },
    },
  },
};

/** Autofocus and highlight OTP input */
export const AutoFocus: Story = {
  render: args => (
    <InputOTP
      {...args}
      className="ring-2 ring-ring/20"
      maxLength={6}
      autoFocus
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'OTP input with auto-focus and highlight ring.',
      },
    },
  },
};
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '../input-otp';

const meta: Meta<any> = {
  title: 'Components/ui/InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
  },
};

export default meta;

export const Default = () => <InputOTP {...({ maxLength: 6 } as any)} />;

export const FourWithSeparator = () => (
  <InputOTPGroup>
    <InputOTP {...({ maxLength: 2 } as any)} />
    <InputOTPSeparator className="mx-2" />
    <InputOTP {...({ maxLength: 2 } as any)} />
  </InputOTPGroup>
);

export const Disabled = () => (
  <InputOTP {...({ containerClassName: 'opacity-50', maxLength: 6, disabled: true } as any)} />
);

export const AutoFocus = () => (
  <InputOTP {...({ className: 'ring-2 ring-ring/20', maxLength: 6, autoFocus: true } as any)} />
);

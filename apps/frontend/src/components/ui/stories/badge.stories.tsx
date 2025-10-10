import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import { Badge, BadgeButton, BadgeDot } from '../badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/ui/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'warning', 'info', 'outline', 'destructive'],
    },
    appearance: { control: { type: 'select' }, options: ['default', 'light', 'outline', 'ghost'] },
    size: { control: { type: 'select' }, options: ['lg', 'md', 'sm', 'xs'] },
    shape: { control: { type: 'select' }, options: ['default', 'circle'] },
    disabled: { control: 'boolean' },
    asChild: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
};

export const Info: Story = {
  args: {
    children: 'Info',
    variant: 'info',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const Sizes: Story = {
  render: args => (
    <div className="flex items-center gap-2">
      <Badge {...args} size="xs">
        XS
      </Badge>
      <Badge {...args} size="sm">
        SM
      </Badge>
      <Badge {...args} size="md">
        MD
      </Badge>
      <Badge {...args} size="lg">
        LG
      </Badge>
    </div>
  ),
  args: {
    variant: 'primary',
  },
};

export const WithDot: Story = {
  render: args => (
    <div className="flex items-center gap-2">
      <Badge {...args}>
        <span className="flex items-center gap-2">
          Messages
          <BadgeDot />
        </span>
      </Badge>
    </div>
  ),
  args: {
    variant: 'info',
  },
};

export const WithButton: Story = {
  render: args => (
    <div className="flex items-center gap-2">
      <Badge {...args}>
        Notifications
        <BadgeButton aria-label="clear" />
      </Badge>
    </div>
  ),
  args: {
    variant: 'secondary',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    variant: 'primary',
  },
};

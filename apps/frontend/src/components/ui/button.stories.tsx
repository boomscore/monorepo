import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';


import { Button, ButtonArrow } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/ui/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'primary',
        'mono',
        'destructive',
        'secondary',
        'outline',
        'dashed',
        'ghost',
        'dim',
        'foreground',
        'inverse',
      ],
    },
   
    mode: {
      control: { type: 'select' },
      options: ['default', 'icon', 'link', 'input'],
    },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md', 'sm', 'icon'],
    },
    shape: {
      control: { type: 'select' },
      options: ['default', 'circle'],
    },
    appearance: {
      control: { type: 'select' },
      options: ['default', 'ghost'],
    },
    autoHeight: { control: 'boolean' },
    underlined: { control: 'select', options: ['solid', 'dashed'] },
    underline: { control: 'select', options: ['solid', 'dashed'] },
    placeholder: { control: 'boolean' },
    asChild: { control: 'boolean' },
      onClick: { action: 'clicked' },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
    size: 'sm',
    // mode: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
    size: 'md',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
    size: 'md',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
    size: 'md',
  },
};

export const Mono: Story = {
  args: {
    children: 'Mono',
    variant: 'mono',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: args => (
    <div className="flex items-center gap-3">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
  args: {
    children: 'Button',
    variant: 'primary',
  },
};

export const IconOnly: Story = {
  render: args => (
    <Button {...args} aria-label="icon-button" size="icon">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
      </svg>
    </Button>
  ),
  args: {
    variant: 'primary',
  },
};

export const LinkMode: Story = {
  args: {
    children: 'Read more',
    variant: 'primary',
    mode: 'link',
    underline: 'solid',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    variant: 'primary',
  },
};

export const WithArrow: Story = {
  render: args => (
    <Button {...args} className='flex items-center gap-2 px-4'>
      Explore
      <ButtonArrow />
    </Button>
  ),
  args: {
    variant: 'primary',
  },
};

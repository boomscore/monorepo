import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import { Input, InputAddon, InputGroup, InputWrapper } from '../input';
import { Button } from '../button';
import { Label } from '../label';

const meta: Meta<typeof Input> = {
  title: 'Components/ui/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: { type: 'select' }, options: ['lg', 'md', 'sm'] },
    type: { control: { type: 'text' } },
    className: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Sizes: Story = {
  render: args => (
    <div className="flex flex-col gap-3" style={{ width: 420 }}>
      <Input {...args} variant="lg" placeholder="Large input" />
      <Input {...args} variant="md" placeholder="Medium input" />
      <Input {...args} variant="sm" placeholder="Small input" />
    </div>
  ),
};

export const WithAddon: Story = {
  render: args => (
    <div style={{ width: 420 }}>
      <InputGroup>
        <Input {...args} placeholder="Amount" />
        <InputAddon>$</InputAddon>
      </InputGroup>
    </div>
  ),
};

export const WithButton: Story = {
  render: args => (
    <div style={{ width: 420 }}>
      <InputWrapper>
        <Input {...args} placeholder="Search" />
        <Button size="sm">Go</Button>
      </InputWrapper>
    </div>
  ),
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import { Label } from '../label';

const meta: Meta<typeof Label> = {
  title: 'Components/ui/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: 'Label',
  },
};

export const Disabled: Story = {
  render: () => (
    <Label aria-disabled="true" className="opacity-50 pointer-events-none">
      Disabled Label
    </Label>
  ),
};

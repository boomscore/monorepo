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
    variant: {
      control: { type: 'select' },
      options: ['lg', 'md', 'sm'],
      description: 'Input size variant',
    },
    type: {
      control: { type: 'text' },
      description: 'Input type (e.g., text, password)',
    },
    className: {
      control: 'text',
      description: 'Custom CSS class for Input',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `Flexible Input component for forms and UI.

### Usage

\`\`\`tsx
import { Input, InputAddon, InputGroup, InputWrapper } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

<Input variant="md" placeholder="Your name" />

<InputGroup>
  <Input placeholder="Amount" />
  <InputAddon>$</InputAddon>
</InputGroup>

<InputWrapper>
  <Input placeholder="Search" />
  <Button size="sm">Go</Button>
</InputWrapper>
\`\`\`

See stories below for more examples, including sizes and addons.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

/** Input sizes: large, medium, small */
export const Sizes: Story = {
  render: args => (
    <div className="flex flex-col gap-3 max-w-md">
      <Input {...args} variant="lg" placeholder="Large input" />
      <Input {...args} variant="md" placeholder="Medium input" />
      <Input {...args} variant="sm" placeholder="Small input" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates large, medium, and small input variants.',
      },
    },
  },
};

/** Input with addon (e.g., currency symbol) */
export const WithAddon: Story = {
  render: args => (
    <div className="max-w-md">
      <InputGroup>
        <Input {...args} placeholder="Amount" />
        <InputAddon>$</InputAddon>
      </InputGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input with addon, commonly used for currency or units.',
      },
    },
  },
};

/** Input with button (e.g., search) */
export const WithButton: Story = {
  render: args => (
    <div className="max-w-md">
      <InputWrapper>
        <Input {...args} placeholder="Search" />
        <Button size="sm">Go</Button>
      </InputWrapper>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input with an adjacent button, ideal for search or actions.',
      },
    },
  },
};
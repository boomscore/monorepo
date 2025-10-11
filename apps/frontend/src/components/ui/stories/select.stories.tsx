import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select';

const meta: Meta<typeof Select> = {
  title: 'Components/ui/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    indicatorPosition: {
      control: { type: 'radio' },
      options: ['left', 'right'],
      description: 'Position of the selection indicator',
    },
    indicatorVisibility: {
      control: 'boolean',
      description: 'Show/hide selection indicator',
    },
    indicator: {
      control: 'text',
      description: 'Custom indicator node (optional)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the select',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `A highly customizable Select component built on Radix UI.
        
Usage:
\`\`\`tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

<Select>
  <SelectTrigger size="md">
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="one">Option One</SelectItem>
    <SelectItem value="two">Option Two</SelectItem>
  </SelectContent>
</Select>
\`\`\`
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

/** Basic select with three options */
export const Default: Story = {
  render: args => (
    <Select {...args}>
      <SelectTrigger size="md">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="one">Option One</SelectItem>
        <SelectItem value="two">Option Two</SelectItem>
        <SelectItem value="three">Option Three</SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic select with three options.',
      },
    },
  },
};

/** Grouped options with labels and separators */
export const Grouped: Story = {
  render: args => (
    <Select {...args}>
      <SelectTrigger size="md">
        <SelectValue placeholder="Choose a fruit or vegetable" />
      </SelectTrigger>
      <SelectContent>
       
        <SelectGroup>
             <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectGroup>
        <SelectSeparator />
      
        <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="lettuce">Lettuce</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grouped select items with labels and separators.',
      },
    },
  },
};

/** Select with indicator on the right */
export const RightIndicator: Story = {
  render: args => (
    <Select indicatorPosition="right" {...args}>
      <SelectTrigger size="md">
        <SelectValue placeholder="With right indicator" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">A</SelectItem>
        <SelectItem value="b">B</SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Select with the selection indicator on the right.',
      },
    },
  },
};

/** Showcases all sizes for the SelectTrigger */
export const Sizes: Story = {
  render: args => (
    <div className="flex flex-col gap-3" style={{ width: 320 }}>
      <Select {...args}>
        <SelectTrigger size="sm">
          <SelectValue placeholder="Small" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">One</SelectItem>
        </SelectContent>
      </Select>
      <Select {...args}>
        <SelectTrigger size="md">
          <SelectValue placeholder="Medium" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2">Two</SelectItem>
        </SelectContent>
      </Select>
      <Select {...args}>
        <SelectTrigger size="lg">
          <SelectValue placeholder="Large" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="3">Three</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates small, medium, and large select triggers.',
      },
    },
  },
};

/** Disabled select */
export const Disabled: Story = {
  render: args => (
    <Select {...args} disabled>
      <SelectTrigger size="md">
        <SelectValue placeholder="Disabled" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="x">X</SelectItem>
      </SelectContent>
    </Select>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled select component.',
      },
    },
  },
};
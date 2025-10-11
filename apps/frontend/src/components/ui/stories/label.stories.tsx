import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import { Label } from '../label';

const meta: Meta<typeof Label> = {
  title: 'Components/ui/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Custom CSS class for the Label',
    },
    children: {
      control: 'text',
      description: 'Label content',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `A simple Label component, typically used to annotate form fields.

### Usage

\`\`\`tsx
import { Label } from '@/components/ui/label';

<Label>Name</Label>
<Label className="text-muted-foreground">Email Address</Label>
\`\`\`

Supports custom styling and disabled state.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Label>;

/** Default label */
export const Default: Story = {
  args: {
    children: 'Label',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default label for annotating form fields.',
      },
    },
  },
};

/** Disabled label */
export const Disabled: Story = {
  render: () => (
    <Label aria-disabled="true" className="opacity-50 pointer-events-none">
      Disabled Label
    </Label>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Label in a disabled state, useful for disabled form fields.',
      },
    },
  },
};
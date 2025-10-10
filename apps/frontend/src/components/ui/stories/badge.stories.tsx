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
      description: 'Visual style of the badge',
    },
    appearance: {
      control: { type: 'select' },
      options: ['default', 'light', 'outline', 'ghost'],
      description: 'Badge appearance style',
    },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md', 'sm', 'xs'],
      description: 'Badge size',
    },
    shape: {
      control: { type: 'select' },
      options: ['default', 'circle'],
      description: 'Badge shape',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the badge',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child component',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `Badge component for status, labels, and notifications.

### Usage

\`\`\`tsx
import { Badge, BadgeDot, BadgeButton } from '@/components/ui/badge';

<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Delete</Badge>

{/* Dot and Button examples */}
<Badge variant="info">
  Messages <BadgeDot />
</Badge>
<Badge variant="secondary">
  Notifications <BadgeButton aria-label="clear" />
</Badge>
\`\`\`
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

/** Primary badge variant */
export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary badge variant.',
      },
    },
  },
};

/** Secondary badge variant */
export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Secondary badge variant.',
      },
    },
  },
};

/** Success badge variant */
export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
  parameters: {
    docs: {
      description: {
        story: 'Success badge variant.',
      },
    },
  },
};

/** Warning badge variant */
export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
  parameters: {
    docs: {
      description: {
        story: 'Warning badge variant.',
      },
    },
  },
};

/** Info badge variant */
export const Info: Story = {
  args: {
    children: 'Info',
    variant: 'info',
  },
  parameters: {
    docs: {
      description: {
        story: 'Info badge variant.',
      },
    },
  },
};

/** Outline badge variant */
export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
  parameters: {
    docs: {
      description: {
        story: 'Outline badge variant.',
      },
    },
  },
};

/** Destructive badge variant */
export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
  parameters: {
    docs: {
      description: {
        story: 'Destructive badge variant.',
      },
    },
  },
};

/** Shows all badge sizes */
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
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates all badge sizes.',
      },
    },
  },
};

/** Badge with a dot indicator */
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
  parameters: {
    docs: {
      description: {
        story: 'Badge with a dot indicator, e.g., for unread messages.',
      },
    },
  },
};

/** Badge with a button (e.g., clear notification) */
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
  parameters: {
    docs: {
      description: {
        story: 'Badge with an action button, e.g., clear notification.',
      },
    },
  },
};

/** Disabled badge */
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    variant: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled badge.',
      },
    },
  },
};
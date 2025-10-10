import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import { Button, ButtonArrow } from '../button';

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
      description: 'Button visual style',
    },
    mode: {
      control: { type: 'select' },
      options: ['default', 'icon', 'link', 'input'],
      description: 'Button mode (default, icon, link, input)',
    },
    size: {
      control: { type: 'select' },
      options: ['lg', 'md', 'sm', 'icon'],
      description: 'Button size',
    },
    shape: {
      control: { type: 'select' },
      options: ['default', 'circle'],
      description: 'Button shape',
    },
    appearance: {
      control: { type: 'select' },
      options: ['default', 'ghost'],
      description: 'Button appearance',
    },
    autoHeight: {
      control: 'boolean',
      description: 'Auto adjust height',
    },
    underlined: {
      control: 'select',
      options: ['solid', 'dashed'],
      description: 'Underlined style',
    },
    underline: {
      control: 'select',
      options: ['solid', 'dashed'],
      description: 'Underline style',
    },
    placeholder: {
      control: 'boolean',
      description: 'Show placeholder',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child',
    },
    onClick: { action: 'clicked' },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `A highly customizable Button component. Supports multiple variants, modes, sizes, and shapes.
        
### Usage

\`\`\`tsx
import { Button, ButtonArrow } from '@/components/ui/button';

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button variant="mono">Mono</Button>

// With an arrow
<Button variant="primary">
  Explore <ButtonArrow />
</Button>
\`\`\`

All variants and sizes are demonstrated in the stories below. Click any button to see the action in the Storybook Actions panel.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

/** Primary button variant */
export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
    size: 'sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary button variant.',
      },
    },
  },
};

/** Secondary button variant */
export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Secondary button variant.',
      },
    },
  },
};

/** Ghost button variant */
export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Ghost button variant.',
      },
    },
  },
};

/** Outline button variant */
export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Outline button variant.',
      },
    },
  },
};

/** Destructive button variant */
export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Destructive button variant.',
      },
    },
  },
};

/** Mono button variant */
export const Mono: Story = {
  args: {
    children: 'Mono',
    variant: 'mono',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Mono button variant.',
      },
    },
  },
};

/** Button Sizes */
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
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates small, medium, and large button sizes.',
      },
    },
  },
};

/** Icon-only button */
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
  parameters: {
    docs: {
      description: {
        story: 'Button with icon only.',
      },
    },
  },
};

/** Button in link mode */
export const LinkMode: Story = {
  args: {
    children: 'Read more',
    variant: 'primary',
    mode: 'link',
    underline: 'solid',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button rendered as a link.',
      },
    },
  },
};

/** Disabled button */
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    variant: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled button.',
      },
    },
  },
};

/** Button with arrow icon */
export const WithArrow: Story = {
  render: args => (
    <Button {...args} className="flex items-center gap-2 px-4">
      Explore
      <ButtonArrow />
    </Button>
  ),
  args: {
    variant: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with arrow icon.',
      },
    },
  },
};

/** Shows all button variants together */
export const Variants: Story = {
  render: args => (
    <div className="flex flex-col items-center justify-center gap-2">
      <Button {...args} variant="primary">Primary</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="outline">Outline</Button>
      <Button {...args} variant="destructive">Destructive</Button>
      <Button {...args} variant="mono">Mono</Button>
      <Button {...args} variant="dashed">Dashed</Button>
      <Button {...args} variant="dim">Dim</Button>
      <Button {...args} variant="foreground">Foreground</Button>
      <Button {...args} variant="inverse">Inverse</Button>
    </div>
  ),
  args: {
    children: 'Button',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'All button variants, for quick comparison.',
      },
    },
  },
};
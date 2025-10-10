import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  CardFooter,
} from '../card';
import { Button } from '../button';

const meta: Meta<typeof Card> = {
  title: 'Components/ui/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text', description: 'Custom CSS class for Card' },
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'outline'],
      description: 'Card visual style',
    },
    padding: {
      control: { type: 'radio' },
      options: ['sm', 'md', 'lg'],
      description: 'Card padding size',
    },
    gap: {
      control: { type: 'radio' },
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Gap between Card sections',
    },
  },
  args: {
    variant: 'primary',
    padding: 'md',
    gap: 'lg',
  },
  parameters: {
    docs: {
      description: {
        component: `A reusable Card component for layouts and UI grouping.

### Usage

\`\`\`tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

<Card variant="primary" padding="md" gap="lg">
  <CardHeader>
    <CardTitle>Card title</CardTitle>
    <CardDescription>Short description.</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
    <Button variant="outline">Cancel</Button>
  </CardFooter>
</Card>
\`\`\`

See stories below for more complex usage, including grouped header, footer actions, and content layouts.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

/** Default layout with header, content, and footer */
export const Default: Story = {
  render: args => (
    <Card {...args} className="max-w-md">
      <CardHeader>
        <div>
          <CardTitle>Card title</CardTitle>
          <CardDescription>
            This is a short description to explain the card content.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">The card content goes here.</p>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-muted-foreground">Updated 2 days ago</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              Cancel
            </Button>
            <Button size="sm">Save</Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default card with header, content, and footer actions.',
      },
    },
  },
};

/** Card with action button in the header */
export const WithAction: Story = {
  render: args => (
    <Card {...args} className="max-w-lg">
      <CardHeader>
        <div>
          <CardTitle>Project Updates</CardTitle>
          <CardDescription>Latest activity across the project.</CardDescription>
        </div>
        <CardAction>
          <Button size="sm">Edit</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          <li>Deployed new release</li>
          <li>Updated dependencies</li>
          <li>Resolved 3 issues</li>
        </ul>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card with header action and list-style content.',
      },
    },
  },
};

/** Card with only a header */
export const HeaderOnly: Story = {
  args: {
    variant: 'outline',
    padding: 'lg',
    className: 'Hello',
  },
  render: args => (
    <Card {...args} className="max-w-md">
      <CardHeader>
        <div>
          <CardTitle>Only header</CardTitle>
          <CardDescription>Cards can be header-first without content.</CardDescription>
        </div>
      </CardHeader>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card with only header section.',
      },
    },
  },
};

/** Card with footer actions */
export const WithFooter: Story = {
  render: args => (
    <Card {...args} className="max-w-md">
      <CardContent>
        <p className="text-sm text-muted-foreground">Content-focused card with footer actions.</p>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-end gap-2 w-full">
          <Button size="sm" variant="ghost">
            Dismiss
          </Button>
          <Button size="sm">Confirm</Button>
        </div>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card with content and footer actions.',
      },
    },
  },
};

/** Complex card layout with header, content grid, action and footer */
export const Complex: Story = {
  render: args => (
    <Card {...args} className="max-w-xl">
      <CardHeader>
        <div>
          <CardTitle>Complex card</CardTitle>
          <CardDescription>Combines header, content, action and footer.</CardDescription>
        </div>
        <CardAction>
          <Button size="sm" variant="outline">
            Share
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            Main content area with multiple paragraphs.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-muted/20 rounded">Item A</div>
            <div className="p-3 bg-muted/20 rounded">Item B</div>
            <div className="p-3 bg-muted/20 rounded">Item C</div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-muted-foreground">Status: Active</div>
          <div className="flex items-center gap-2">
            <Button size="sm">Cancel</Button>
            <Button size="sm" variant="primary">
              Proceed
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complex card layout combining all sections.',
      },
    },
  },
};
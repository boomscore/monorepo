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
    className: { control: 'text' },
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'outline'],
    },
    padding: {
      control: { type: 'radio' },
      options: ['sm', 'md', 'lg'],
    },
    gap: {
      control: { type: 'radio' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
  args: {
    variant: 'primary',
    padding: 'md',
    gap: 'lg',
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

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
};

export const WithAction: Story = {
  render: args => (
    <Card {...args} style={{ width: 540 }}>
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
};

export const HeaderOnly: Story = {
  args: {
    variant: 'outline',
    padding: 'lg',
    className: 'Hello',
  },

  render: args => (
    <Card {...args} style={{ width: 420 }}>
      <CardHeader>
        <div>
          <CardTitle>Only header</CardTitle>
          <CardDescription>Cards can be header-first without content.</CardDescription>
        </div>
      </CardHeader>
    </Card>
  ),
};

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
};

export const Complex: Story = {
  render: args => (
    <Card {...args} style={{ width: 640 }}>
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
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/ui/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    // These argTypes are for documentation and controls.
    // The actual variant/size/shape props are passed to TabsList and TabsTrigger, not Tabs.
    // You can add controls here if you want to demo dynamic prop changes.
  },
  parameters: {
    docs: {
      description: {
        component: `Highly customizable Tabs component built on Radix UI.

### Usage

\`\`\`tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList variant="default" size="md">
    <TabsTrigger value="tab1">Tab One</TabsTrigger>
    <TabsTrigger value="tab2">Tab Two</TabsTrigger>
    <TabsTrigger value="tab3">Tab Three</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content for Tab One</TabsContent>
  <TabsContent value="tab2">Content for Tab Two</TabsContent>
  <TabsContent value="tab3">Content for Tab Three</TabsContent>
</Tabs>
\`\`\`

Supports multiple variants, shapes, and sizes as shown in the stories below.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tabs>;

/** Default tabs with three triggers */
export const Default: Story = {
  render: args => (
    <Tabs defaultValue="tab1" {...args}>
      <TabsList variant="default" size="md">
        <TabsTrigger value="tab1">Tab One</TabsTrigger>
        <TabsTrigger value="tab2">Tab Two</TabsTrigger>
        <TabsTrigger value="tab3">Tab Three</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="p-4">Content for Tab One</div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className="p-4">Content for Tab Two</div>
      </TabsContent>
      <TabsContent value="tab3">
        <div className="p-4">Content for Tab Three</div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic tabs with three triggers and content panels.',
      },
    },
  },
};

/** Tabs with line variant */
export const LineVariant: Story = {
  render: args => (
    <Tabs defaultValue="tab1" {...args}>
      <TabsList variant="line" size="md">
        <TabsTrigger value="tab1">Tab One</TabsTrigger>
        <TabsTrigger value="tab2">Tab Two</TabsTrigger>
        <TabsTrigger value="tab3">Tab Three</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="p-4">Content for Tab One</div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className="p-4">Content for Tab Two</div>
      </TabsContent>
      <TabsContent value="tab3">
        <div className="p-4">Content for Tab Three</div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tabs styled with the line variant.',
      },
    },
  },
};

/** Tabs with pill shape */
export const PillShape: Story = {
  render: args => (
    <Tabs defaultValue="tab1" {...args}>
      <TabsList variant="default" shape="pill" size="md">
        <TabsTrigger value="tab1">Tab One</TabsTrigger>
        <TabsTrigger value="tab2">Tab Two</TabsTrigger>
        <TabsTrigger value="tab3">Tab Three</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="p-4">Content for Tab One</div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className="p-4">Content for Tab Two</div>
      </TabsContent>
      <TabsContent value="tab3">
        <div className="p-4">Content for Tab Three</div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tabs styled with pill shape.',
      },
    },
  },
};

/** Tabs with different sizes */
export const Sizes: Story = {
  render: args => (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="tab1" {...args}>
        <TabsList variant="default" size="lg">
          <TabsTrigger value="tab1">Large</TabsTrigger>
          <TabsTrigger value="tab2">Large</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <div className="p-4">Content for Large Tabs</div>
        </TabsContent>
        <TabsContent value="tab2">
          <div className="p-4">Content for Large Tabs</div>
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="tab1" {...args}>
        <TabsList variant="default" size="md">
          <TabsTrigger value="tab1">Medium</TabsTrigger>
          <TabsTrigger value="tab2">Medium</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <div className="p-4">Content for Medium Tabs</div>
        </TabsContent>
        <TabsContent value="tab2">
          <div className="p-4">Content for Medium Tabs</div>
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="tab1" {...args}>
        <TabsList variant="default" size="sm">
          <TabsTrigger value="tab1">Small</TabsTrigger>
          <TabsTrigger value="tab2">Small</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <div className="p-4">Content for Small Tabs</div>
        </TabsContent>
        <TabsContent value="tab2">
          <div className="p-4">Content for Small Tabs</div>
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="tab1" {...args}>
        <TabsList variant="default" size="xs">
          <TabsTrigger value="tab1">X-Small</TabsTrigger>
          <TabsTrigger value="tab2">X-Small</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <div className="p-4">Content for X-Small Tabs</div>
        </TabsContent>
        <TabsContent value="tab2">
          <div className="p-4">Content for X-Small Tabs</div>
        </TabsContent>
      </Tabs>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tabs in large, medium, small, and extra small sizes.',
      },
    },
  },
};
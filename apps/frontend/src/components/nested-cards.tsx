import React, { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui';

const nestedCardsVariants = cva('', {
  variants: {
    direction: {
      normal: 'flex-col',
      reverse: 'flex-col-reverse',
    },
    padding: {
      none: 'p-0',
      px: 'p-px',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    direction: 'normal',
    padding: 'px',
  },
});

type NestedCardsVariants = VariantProps<typeof nestedCardsVariants>;

interface NestedCardsProps extends NestedCardsVariants {
  header: ReactNode;
  footer: ReactNode;
  className?: string;
}

export const NestedCards = ({
  header,
  footer,
  direction,
  padding,
  className,
}: NestedCardsProps) => {
  return (
    <Card className={cn(nestedCardsVariants({ direction, padding }), ' gap-0', className)}>
      <CardContent className="p-2">{header}</CardContent>
      <Card className="bg-app-background p-0 border-none" variant="secondary">
        <CardContent className="p-2">{footer}</CardContent>
      </Card>
    </Card>
  );
};

import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-1 font-mono text-[9.5px] tracking-wide whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-[#FDBA74] bg-portal-orange-soft text-[#9A3412]',
        destructive: 'border-[#FCA5A5] bg-portal-red-soft text-[#991B1B]',
        success: 'border-[#86EFAC] bg-portal-green-soft text-[#166534]',
        secondary: 'border-line bg-cream text-ink-2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

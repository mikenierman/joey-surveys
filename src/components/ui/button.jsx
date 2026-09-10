import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-[11.5px] font-mono font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-ink text-cream border-[1.5px] border-ink hover:bg-[#33302C]',
        outline: 'border-[1.5px] border-line bg-white text-ink hover:border-ink',
        ghost: 'hover:bg-cream text-ink',
        soft: 'border-[1.5px] border-line bg-white text-ink',
      },
      size: {
        default: 'h-10 px-3.5 py-2.5',
        sm: 'h-8 px-3 text-[11px]',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const Button = React.forwardRef(function Button(
  { className, variant, size, type = 'button', ...props },
  ref
) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  );
});

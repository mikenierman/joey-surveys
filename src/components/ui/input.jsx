import * as React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(function Input({ className, type = 'text', ...props }, ref) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-xl border-[1.5px] border-ink bg-white px-3.5 py-2.5 text-sm font-semibold text-ink placeholder:font-medium placeholder:text-ink-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-portal-blue',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

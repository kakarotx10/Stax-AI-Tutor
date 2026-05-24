'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150 ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-soft hover:bg-[hsl(var(--primary-hover))] active:bg-[hsl(var(--primary-pressed))]',
        primary:
          'bg-primary text-primary-foreground shadow-soft hover:bg-[hsl(var(--primary-hover))] active:bg-[hsl(var(--primary-pressed))]',
        secondary:
          'border border-border bg-card text-foreground shadow-soft hover:border-border-strong hover:bg-muted',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-muted hover:border-border-strong',
        ghost: 'bg-transparent text-foreground hover:bg-muted',
        link: 'text-primary underline-offset-4 hover:underline',
        danger:
          'bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        default: 'h-10 px-4',
        lg: 'h-11 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? 'Loading…' : children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

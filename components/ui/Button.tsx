'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:bg-[hsl(var(--primary-hover))] active:translate-y-0 active:bg-[hsl(var(--primary-pressed))]',
        primary:
          'bg-primary text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:bg-[hsl(var(--primary-hover))] active:translate-y-0 active:bg-[hsl(var(--primary-pressed))]',
        secondary:
          'border border-border bg-card/90 text-foreground shadow-soft hover:-translate-y-0.5 hover:border-border-strong hover:bg-muted active:translate-y-0',
        outline:
          'border border-border bg-background/60 text-foreground hover:-translate-y-0.5 hover:bg-muted hover:border-border-strong active:translate-y-0',
        ghost: 'bg-transparent text-foreground hover:bg-muted',
        link: 'text-primary underline-offset-4 hover:underline',
        danger:
          'bg-destructive text-destructive-foreground shadow-soft hover:-translate-y-0.5 hover:bg-destructive/90 active:translate-y-0',
        destructive:
          'bg-destructive text-destructive-foreground shadow-soft hover:-translate-y-0.5 hover:bg-destructive/90 active:translate-y-0',
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
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            Loading...
          </>
        ) : children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

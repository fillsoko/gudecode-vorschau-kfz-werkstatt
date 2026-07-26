import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import type { ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-body text-sm font-medium uppercase tracking-widest transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[#FF6B00] text-white rounded hover:bg-[#E55F00]',
        secondary: 'border border-[#222222] text-white rounded hover:bg-[#111111]',
        ghost: 'text-[#999999] hover:text-white',
      },
      size: {
        default: 'px-8 py-3',
        sm: 'px-4 py-2 text-xs',
        lg: 'px-10 py-4',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };

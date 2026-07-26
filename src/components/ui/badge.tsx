import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import type { HTMLAttributes } from 'react';

const badgeVariants = cva(
  'inline-block font-mono text-xs uppercase tracking-wider rounded',
  {
    variants: {
      variant: {
        default: 'px-3 py-1 text-[#555555] border border-[#FF6B0033]',
        accent: 'px-3 py-1 text-[#FF6B00] border border-[#FF6B0033]',
        subtle: 'px-2 py-0.5 text-[#999999] bg-[#111111]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

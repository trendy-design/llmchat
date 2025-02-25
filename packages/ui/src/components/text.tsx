import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '../lib/utils';

import React from 'react';

const typeVariants = cva('text flex !my-0', {
  variants: {
    size: {
      xxs: 'text-xs',
      xs: 'text-xs',
      sm: 'text-xs md:text-sm',
      base: 'text-sm md:text-base',
      lg: 'text-base md:text-lg',
      xl: 'text-lg md:text-xl',
    },
    textColor: {
      primary: 'text-foreground',
      secondary: 'text-muted-foreground',
      tertiary: 'text-tertiary-foreground',
      white: 'text-white',
    },
    weight: {
      regular: 'font-normal',
      medium: 'font-medium',
      bold: 'font-semibold',
    },
  },

  defaultVariants: {
    size: 'sm',
    textColor: 'primary',
    weight: 'regular',
  },
});

export interface TypeProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof typeVariants> {
  asChild?: boolean;
}

export const Type = React.forwardRef<HTMLParagraphElement, TypeProps>(
  ({ className, size, textColor, weight, asChild = false, ...props }, ref) => {
    return (
      <p className={cn(typeVariants({ size, textColor, className, weight }))} ref={ref} {...props}>
        {props.children}
      </p>
    );
  }
);

Type.displayName = 'Type';

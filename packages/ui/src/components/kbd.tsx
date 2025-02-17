import { Icon, IconProps } from '@tabler/icons-react';
import * as React from 'react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { cn } from '../lib/utils';

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  icon?: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  children: React.ReactNode;
}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, icon: Icon, children, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        className={cn(
          'flex h-5 items-center rounded-md border px-1.5 font-mono text-[10px] font-medium text-gray-500',
          className
        )}
        {...props}
      >
        {Icon && <Icon className="size-3" strokeWidth={2} />}
        {children}
      </kbd>
    );
  }
);

Kbd.displayName = 'Kbd';

export { Kbd };

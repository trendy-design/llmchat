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
      <div className="flex flex-row items-center gap-1">
      { Icon && <kbd
        ref={ref}
        className={cn(
          'flex size-5 items-center justify-center rounded-md border font-mono text-[10px] font-medium text-muted-foreground',
          className
        )}
        {...props}
      >
          <Icon className="size-3" strokeWidth={2} />
        </kbd>
  }
      <kbd
        ref={ref}
        className={cn(
          'flex size-5 items-center justify-center rounded-md border px-1.5 font-mono text-[10px] font-medium text-muted-foreground',
          className
        )}
        {...props}
      >
        {children}
      </kbd>
      </div>
    );
  }
);

Kbd.displayName = 'Kbd';

export { Kbd };

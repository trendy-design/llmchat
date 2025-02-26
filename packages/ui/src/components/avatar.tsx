import { cn } from '../lib/utils';

export type TAvatar = {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};
export const Avatar = ({ name, size = 'md', className }: TAvatar) => {
  const sizes = {
    sm: 28,
    md: 32,
    lg: 48,
  };

  return (
    <div
      className={cn(
        'bg-secondary text-secondary-foreground relative rounded-full',
        size === 'sm' && 'h-7 min-w-7',
        size === 'md' && 'h-8 min-w-8',
        size === 'lg' && 'h-12 min-w-12',
        className
      )}
    >
      <p className="absolute inset-0 flex items-center justify-center font-bold uppercase">
        {name?.[0]}
      </p>
    </div>
  );
};

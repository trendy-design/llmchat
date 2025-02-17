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
        'relative rounded-full bg-black/10 text-zinc-900/70 dark:bg-white/10 dark:text-white',
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

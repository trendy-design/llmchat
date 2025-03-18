import { cn } from '@repo/shared/utils';
import { Globe } from 'lucide-react';
import Image from 'next/image';
import { FC, useState } from 'react';

export type LinkFaviconType = {
  link?: string;
  className?: string;
  size?: 'sm' | 'md';
};

const FallbackIcon = ({ size, className }: { size: 'sm' | 'md'; className?: string }) => (
  <Globe
    size={size === 'sm' ? 12 : 16}
    strokeWidth={2}
    className={cn('text-gray-500 shrink-0', className)}
  />
);

export const LinkFavicon: FC<LinkFaviconType> = ({ link, className, size = 'sm' }) => {
  const [error, setError] = useState<boolean>(false);
  
  if (error) {
    return <FallbackIcon size={size} className={className} />;
  }

  return (
    <Image
      src={`https://www.google.com/s2/favicons?domain=${link}&sz=${256}`}
      alt="favicon"
      onError={() => setError(true)}
      width={0}
      height={0}
      className={cn('rounded-sm object-cover shrink-0', className, size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')}
      sizes="70vw"
      unoptimized={false}
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg=="
    />
  );
};

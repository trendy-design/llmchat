'use client';
import { cn } from '@repo/ui';
import { Globe } from 'lucide-react';
import { FC, useState } from 'react';

export type LinkFaviconType = {
    link?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
};

const FallbackIcon = ({ size, className }: { size: 'sm' | 'md' | 'lg'; className?: string }) => (
    <Globe
        size={size === 'sm' ? 12 : size === 'md' ? 16 : 20}
        strokeWidth={2}
        className={cn('shrink-0 text-gray-500', className)}
    />
);

export const LinkFavicon: FC<LinkFaviconType> = ({ link, className, size = 'sm' }) => {
    const [error, setError] = useState<boolean>(false);

    if (error) {
        return <FallbackIcon size={size} className={className} />;
    }

    return (
        <div
            className={cn(
                'bg-tertiary relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border',
                size === 'sm' && 'h-4 w-4',
                size === 'md' && 'h-5 w-5',
                size === 'lg' && 'h-8 w-8'
            )}
        >
            <div className="border-foreground/10 absolute inset-0 z-[2] rounded-full border" />
            <img
                src={`https://www.google.com/s2/favicons?domain=${link}&sz=${128}`}
                alt="favicon"
                onError={() => setError(true)}
                className={cn('absolute inset-0 h-full w-full rounded-sm object-cover', className)}
            />
        </div>
    );
};

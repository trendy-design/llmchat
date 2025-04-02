'use client';

import { LinkFavicon } from '@repo/common/components';
import { Source } from '@repo/shared/types';
import { getHost } from '@repo/shared/utils';
import React, { memo, useState } from 'react';

export type LinkPreviewType = {
    url: string;
    children: React.ReactNode;
};

export const LinkPreview = ({ url, children }: LinkPreviewType) => {
    const [isHovered, setIsHovered] = useState(false);

    if (!url?.trim()?.length) {
        return null;
    }

    const handleMouseEnter = () => {
        console.log('mouse enter');
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        console.log('mouse leave');
        setIsHovered(false);
    };

    return <>{children}</>;

    // return <Popover open={isHovered} onOpenChange={setIsHovered}>
    //   <PopoverTrigger onMouseEnter={handleMouseEnter}
    //     onMouseLeave={handleMouseLeave}
    //     onClick={e => {
    //       e.preventDefault();
    //     }} asChild>
    //     {children}
    //   </PopoverTrigger>
    //   <PopoverContent className='z-[10] bg-background p-0'>
    //     <WebsitePreview url={url} />
    //   </PopoverContent>
    // </Popover>
};

// Add this cache outside the component
const ogCache = new Map<string, any>();

export const WebsitePreview = memo(({ source }: { source: Source }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [ogResult, setOgResult] = useState<any | null>(null);

    return (
        <div className="not-prose">
            <div className="flex flex-col items-start">
                <div className="flex w-full flex-col items-start gap-1.5">
                    <div className="flex flex-row items-start gap-2.5">
                        <div className="flex flex-col items-start gap-4">
                            <p className="text-muted-foreground line-clamp-1 flex w-full flex-row items-center gap-2 font-sans text-xs">
                                <LinkFavicon link={source.link} size="md" />
                                {getHost(source.link)}
                            </p>
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-foreground line-clamp-2 w-full overflow-hidden font-sans text-xs font-semibold leading-tight">
                                    {source.title}
                                </p>

                                <p className="text-muted-foreground line-clamp-2 w-full font-sans text-xs">
                                    {source?.snippet}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

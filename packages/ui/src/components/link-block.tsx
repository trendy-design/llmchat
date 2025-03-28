'use client';

import Image from 'next/image';
import React, { memo, useEffect, useMemo, useState } from 'react';

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

export const WebsitePreview = memo(({ url }: { url: string }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [ogResult, setOgResult] = useState<any | null>(null);

    const fetchOg = async (url: string) => {
        try {
            if (ogCache.has(url)) {
                setOgResult(ogCache.get(url));
                return;
            }

            setIsLoading(true);
            const res = await fetch(`/og?url=${url}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();

            if (data) {
                ogCache.set(url, data);
                setOgResult(data);
            } else {
                setOgResult(undefined);
            }
        } catch (e) {
            setOgResult(undefined);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOg(url);
    }, [url]);

    const parsedUrl = useMemo(() => {
        try {
            return new URL(url);
        } catch (e) {
            return null;
        }
    }, [url]);

    if (!parsedUrl) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex w-full animate-pulse flex-col items-start">
                <div className="flex w-full items-center gap-1.5">
                    <div className="bg-muted h-4 w-4 rounded-full" />
                    <div className="bg-muted h-3 w-24 rounded" />
                </div>
                <div className="mt-2 w-full space-y-2">
                    <div className="bg-muted h-4 w-3/4 rounded" />
                    <div className="bg-muted h-4 w-1/2 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div>
            {ogResult && ogResult.title && ogResult.url ? (
                <div className="flex flex-col items-start">
                    <div className="flex w-full flex-col items-start gap-1.5">
                        <div className="flex flex-row items-center gap-1.5">
                            <Image
                                src={ogResult.favicon}
                                alt={ogResult?.title}
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="h-6 w-6 rounded-full object-cover"
                            />
                            <p className="text-muted-foreground line-clamp-1 w-full text-xs">
                                {parsedUrl.hostname}
                            </p>
                        </div>
                        <p className="text-foreground line-clamp-1 w-full overflow-hidden text-sm font-medium">
                            {ogResult.title}
                        </p>
                        <p className="text-muted-foreground line-clamp-2 text-xs">
                            {ogResult.description}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-row items-center gap-1.5">
                    <Image
                        src={`https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=128`}
                        alt={ogResult?.title}
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="h-6 w-6 rounded-full object-cover"
                    />
                    <p className="text-muted-foreground line-clamp-1 w-full text-xs">
                        {parsedUrl.hostname}
                    </p>
                </div>
            )}
        </div>
    );
});

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
  }

  const handleMouseLeave = () => {
    console.log('mouse leave');
    setIsHovered(false);
  }

  return <>{children}</>

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
      <div className="flex flex-col items-start w-full animate-pulse">
        <div className="flex items-center gap-1.5 w-full">
          <div className="h-4 w-4 rounded-full bg-muted" />
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
        <div className="space-y-2 mt-2 w-full">
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-4 w-1/2 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return <div>
    {
      ogResult && ogResult.title && ogResult.url
        ? <div className="flex flex-col items-start">
          <div className="flex w-full flex-col items-start gap-1.5">
            <div className='flex flex-row items-center gap-1.5'>
              <Image
                src={ogResult.favicon}
                alt={ogResult?.title}
                width={0}
                height={0}
                sizes="100vw"
                className="h-4 w-4 rounded-full object-cover"
              />
              <p className="text-muted-foreground text-xs line-clamp-1 w-full">{parsedUrl.hostname}</p>
            </div>
            <p className="text-foreground w-full font-medium overflow-hidden line-clamp-1 text-sm">
              {ogResult.title}
            </p>
            <p className="text-muted-foreground text-xs line-clamp-2">
              {ogResult.description}
            </p>

          </div>

        </div> : <div className='flex flex-row items-center gap-1.5'>
          <Image
            src={`https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=128`}
            alt={ogResult?.title}
            width={0}
            height={0}
            sizes="100vw"
            className="h-4 w-4 rounded-full object-cover"
          />
            <p className="text-muted-foreground text-xs line-clamp-1 w-full">{parsedUrl.hostname}</p>
        </div>

    }
  </div>
})

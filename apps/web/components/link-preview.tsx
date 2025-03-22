'use client';

import { getHost } from '@/utils/url';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@repo/ui';
import Image from 'next/image';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { LinkFavicon } from './link-favicon';

const ogCache = new Map<string, any>();

export type LinkPreviewType = {
  url: string;
  children: React.ReactNode;
};

export const LinkPreviewPopover = memo(({ url, children }: LinkPreviewType) => {
  if (!url?.trim()?.length) {
    return null;
  }

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild className='cursor-pointer'>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className='z-[10] bg-background p-0'>
        <LinkPreview url={url} />
      </HoverCardContent>
    </HoverCard>
  );
})  ;

export const LinkPreview = memo(({ url }: { url: string }) => {
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
    if(!ogResult) {
      fetchOg(url);
    }
  }, [url]);
  
  const parsedUrl = useMemo(() => {
    try {
      return new URL(url);
    } catch (e) {
      return null;
    }
  }, [url]);

  if (!parsedUrl) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-start p-4 w-full animate-pulse">
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



  return (
    <div>
      {ogResult && ogResult.title && ogResult.url ? (
        <div className="flex flex-col items-start">
          <div className="flex w-full flex-col items-start gap-1.5 p-4">
            <div className='flex flex-row items-center gap-1.5'>
            <LinkFavicon link={getHost(url)} />

              <p className="text-muted-foreground text-xs line-clamp-1 w-full">
                {parsedUrl.hostname}
              </p>
            </div>
            <p className="text-foreground w-full overflow-hidden line-clamp-2 text-sm">
              {ogResult.title}
            </p>
            <p className="text-muted-foreground text-xs line-clamp-4">
              {ogResult.description}
            </p>
          </div>
        </div>
      ) : (
        <div className='flex flex-row items-center gap-1.5 p-4'>
          <Image
            src={`https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=128`}
            alt={ogResult?.title}
            width={0}
            height={0}
            sizes="100vw"
            className="h-4 w-4 rounded-full object-cover"
          />
          <p className="text-muted-foreground text-xs line-clamp-1 w-full">
            {parsedUrl.hostname}
          </p>
        </div>
      )}
    </div>
  );
});

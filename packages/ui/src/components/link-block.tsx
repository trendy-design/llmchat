'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Skeleton } from './skeleton';
export type TLinkBlock = {
  url: string;
};
export const LinkBlock = ({ url }: TLinkBlock) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ogResult, setOgResult] = useState<any | null>(null);

  const fetchOg = async (url: string) => {
    try {
      const res = await fetch('/api/og', {
        method: 'POST',
        body: JSON.stringify({ url }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      const result = data.result;

      if (result) {
        setOgResult(result);
        setIsLoading(false);
      } else {
        setIsLoading(false);

        setOgResult(undefined);
      }
    } catch (e) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (url?.trim()?.length > 0) {
      setIsLoading(true);
      fetchOg(url);
    }
  }, [url]);

  const renderConatiner = (children: React.ReactNode, link?: string) => {
    return (
      <div
        className="cursor-pointer rounded-xl border border-black/10 bg-white p-3 hover:scale-[101%] hover:text-blue-400"
        onClick={() => {
          link && window.open(link, '_blank');
        }}
      >
        {children}
      </div>
    );
  };

  if (!url?.trim()?.length) {
    return null;
  }

  if (isLoading) {
    return renderConatiner(
      <div className="flex flex-row items-start gap-2">
        <Skeleton className="h-6 w-6 rounded-xl" />

        <div className="flex w-full flex-col items-start gap-1">
          <Skeleton className="h-[10px] w-[80%] rounded-full" />
          <Skeleton className="h-[10px] w-[50%] rounded-full" />
        </div>
      </div>
    );
  }

  return ogResult && ogResult.ogTitle && ogResult.ogUrl
    ? renderConatiner(
        <div className="flex flex-row items-start gap-2">
          <Image
            src={ogResult.favicon}
            alt={ogResult.ogTitle}
            width={0}
            height={0}
            sizes="100vw"
            className="h-6 min-w-6 rounded-md border border-black/10 object-cover"
          />

          <div className="flex w-full flex-col items-start gap-1">
            <p className="w-full overflow-hidden truncate text-sm text-zinc-800 md:text-base">
              {ogResult.ogTitle}
            </p>
            <p className="text-sm text-zinc-400 md:text-base">{ogResult.ogUrl}</p>
          </div>
        </div>,
        ogResult.ogUrl
      )
    : renderConatiner(
        <div>
          <p className="text-sm text-zinc-400 md:text-base">{url}</p>
        </div>,
        url
      );
};

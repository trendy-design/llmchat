'use client';

import { CitationProviderContext } from '@/components/thread/citation-provider';
import Image from 'next/image';
import React, { useContext, useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
export type TLinkBlock = {
  url: string;
  children: React.ReactNode;
};
export const LinkBlock = ({ url, children }: TLinkBlock) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ogResult, setOgResult] = useState<any | null>(null);
  const { citations } = useContext(CitationProviderContext)
  const [isHovered, setIsHovered] = useState(false);

  const fetchOg = async (url: string) => {
    try {
      console.log('fetching og', url);
      const res = await fetch(`/og?url=${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });


      const data = await res.json();

      console.log('fetching og', data);


      if (data) {
        setOgResult(data);
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
    if (url?.trim()?.length > 0 && isHovered && !ogResult) {
      setIsLoading(true);
      fetchOg(url);
    }
  }, [url, isHovered]);


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


  return <Popover open={isHovered} onOpenChange={setIsHovered}>
    <PopoverTrigger onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={e => {
        e.preventDefault();
      }} asChild>
      {children}
    </PopoverTrigger>
    <PopoverContent className='z-[10] bg-background p-0'>
      {
        ogResult && ogResult.title && ogResult.url
          ? <div className="flex flex-col items-start">
            <div className="flex w-full flex-col items-start gap-1.5 p-4">
              <div className='flex flex-row items-center gap-1.5'>
                <Image
                  src={ogResult.favicon}
                  alt={ogResult?.title}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="h-4 w-4 rounded-full object-cover"
                />
                <p className="text-muted-foreground text-xs line-clamp-1 w-full">{new URL(ogResult.url).hostname}</p>
              </div>
              <p className="text-foreground w-full overflow-hidden line-clamp-2 text-xs">
                {ogResult.title}
              </p>
              <p className="text-muted-foreground text-xs line-clamp-4">
                {ogResult.description}
              </p>

            </div>

          </div> : <div className='flex flex-row items-center gap-1.5 p-2'>
            <Image
              src={`https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`}
              alt={ogResult?.title}
              width={0}
              height={0}
              sizes="100vw"
              className="h-4 w-4 rounded-full object-cover"
            />
            <p className="text-muted-foreground text-xs line-clamp-1 w-full">{new URL(url).hostname}</p>
          </div>

      }
    </PopoverContent>
  </Popover>
};


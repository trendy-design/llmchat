"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Skeleton } from "./skeleton";
export type TLinkBlock = {
  url: string;
};
export const LinkBlock = ({ url }: TLinkBlock) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ogResult, setOgResult] = useState<any | null>(null);

  const fetchOg = async (url: string) => {
    try {
      const res = await fetch("/api/og", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: {
          "Content-Type": "application/json",
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
        className="bg-white p-3 rounded-xl border border-black/10 hover:scale-[101%] hover:text-blue-400 cursor-pointer"
        onClick={() => {
          link && window.open(link, "_blank");
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
        <Skeleton className="w-6 h-6 rounded-xl" />

        <div className="flex flex-col gap-1 items-start w-full">
          <Skeleton className="w-[80%] h-[10px] rounded-full" />
          <Skeleton className="w-[50%] h-[10px] rounded-full" />
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
            className="min-w-6 h-6 border border-black/10 rounded-md object-cover"
          />

          <div className="flex flex-col gap-1 items-start w-full">
            <p className="text-sm md:text-base text-zinc-800 w-full truncate overflow-hidden">
              {ogResult.ogTitle}
            </p>
            <p className="text-sm md:text-base text-zinc-400">
              {ogResult.ogUrl}
            </p>
          </div>
        </div>,
        ogResult.ogUrl
      )
    : renderConatiner(
        <div>
          <p className="text-sm md:text-base text-zinc-400">{url}</p>
        </div>,
        url
      );
};

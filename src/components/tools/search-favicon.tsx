import { cn } from "@/helper/clsx";
import { Globe02Icon } from "@hugeicons/react";
import Image from "next/image";
import { FC, useState } from "react";

export type TSeachFavicon = {
  link: string;
  className?: string;
};

export const SearchFavicon: FC<TSeachFavicon> = ({ link, className }) => {
  const [error, setError] = useState<boolean>(false);
  if (error) {
    return (
      <Globe02Icon
        size={14}
        strokeWidth={1.5}
        className={cn("text-gray-500", className)}
      />
    );
  }
  return (
    <Image
      src={`https://www.google.com/s2/favicons?domain=${link}&sz=${256}`}
      alt="favicon"
      onError={(e) => {
        setError(true);
      }}
      width={0}
      height={0}
      className={cn("h-4 w-4 rounded-sm object-cover", className)}
      sizes="70vw"
    />
  );
};

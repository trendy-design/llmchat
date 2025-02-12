import { cn } from "@repo/shared/utils";
import { Globe } from "lucide-react";
import Image from "next/image";
import { FC, useState } from "react";

export type TSeachFavicon = {
  link: string;
  className?: string;
  size?: "sm" | "md";
};

export const SearchFavicon: FC<TSeachFavicon> = ({
  link,
  className,
  size = "sm",
}) => {
  const [error, setError] = useState<boolean>(false);
  if (error) {
    return (
      <Globe
        size={size === "sm" ? 16 : 18}
        strokeWidth={2}
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
      className={cn(
        "rounded-sm object-cover",
        className,
        size === "sm" ? "h-4 w-4" : "h-5 w-5",
      )}
      sizes="70vw"
    />
  );
};

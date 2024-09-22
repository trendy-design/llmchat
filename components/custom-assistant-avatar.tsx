import { cn } from "@/lib/utils/clsx";
import Image from "next/image";
import { ModelIcon } from "./model-icon";

export type TCustomAssistantAvatar = {
  url?: string | null;
  alt: string;
  size: "sm" | "md" | "lg" | "xs";
  rounded?: boolean;
};
export const CustomAssistantAvatar = ({
  url,
  size,
  alt,
  rounded = true,
}: TCustomAssistantAvatar) => {
  if (!url) return <ModelIcon type="assistants" size={size} />;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg",
        size === "sm" && "h-6 w-6",
        size === "md" && "h-8 w-8",
        size === "lg" && "h-10 w-10",
        rounded && "rounded-full",
      )}
    >
      <Image
        src={url}
        alt={alt}
        width={0}
        sizes="100vw"
        height={0}
        className="h-full w-full"
      />
      <div
        className={cn(
          "absolute inset-0 rounded-lg border border-zinc-500/20",
          rounded && "rounded-full",
        )}
      />
    </div>
  );
};

import { cn } from "@/lib/utils";
import Avatar from "boring-avatars";
import Image from "next/image";

export type TBotAvatar = {
  avatar?: string;
  name: string;
  size: "small" | "medium" | "large" | number;
};

export const BotAvatar = ({ name, size, avatar }: TBotAvatar) => {
  return (
    <div
      className={cn(
        "flex-shrink-0 overflow-hidden border dark:border-white/10 border-transparent flex items-center justify-center",
        size === "small" && "rounded-lg",
        size === "medium" && "rounded-xl",
        size === "large" && "rounded-2xl"
      )}
    >
      {avatar ? (
        <Image
          width={0}
          height={0}
          alt="avarar"
          sizes="100vw"
          src={avatar}
          className={cn(
            "flex-shrink-0 object-cover",
            size === "small" && "min-w-6 h-6",
            size === "medium" && "min-w-12 h-12",
            size === "large" && "min-w-16 h-16"
          )}
        />
      ) : (
        <Avatar
          size={
            size === "small"
              ? 24
              : size === "medium"
              ? 48
              : size === "large"
              ? 64
              : size
          }
          square
          name={name}
          variant="marble"
          colors={["#0DB2AC", "#F5DD7E", "#FC8D4D", "#FC694D", "#FABA32"]}
        />
      )}
    </div>
  );
};

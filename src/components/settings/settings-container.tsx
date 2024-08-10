import { cn } from "@/helper/clsx";
import { ComponentProps, FC } from "react";
import { Flex, Type } from "../ui";

export type TSettingsContainer = {
  children: React.ReactNode;
  title: string;
};
export const SettingsContainer: FC<
  TSettingsContainer & ComponentProps<typeof Flex>
> = ({ title, children, ...props }) => {
  return (
    <Flex
      direction="col"
      className={cn(
        "flex w-full flex-col items-start gap-4 px-3 md:px-5",
        props.className,
      )}
      {...props}
    >
      <Type
        size="lg"
        weight="medium"
        className="w-full border-b border-zinc-500/10 pb-4"
      >
        {title}
      </Type>
      {children}
    </Flex>
  );
};

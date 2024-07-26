import { cn } from "@/helper/clsx";
import { ComponentProps, FC } from "react";
import { Flex } from "../ui";

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
      <p className="pb-2 pt-4 text-xl font-semibold text-zinc-800 dark:text-zinc-50">
        {title}
      </p>
      {children}
    </Flex>
  );
};

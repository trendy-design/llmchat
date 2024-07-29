import { cn } from "@/helper/clsx";
import { Flex } from "./flex";

export type TFormLabel = {
  children?: React.ReactNode;
  className?: string;
  label: string;
  extra?: () => React.ReactNode;
  isOptional?: boolean;
};
export const FormLabel = ({
  children,
  label,
  extra,
  isOptional,
  className,
}: TFormLabel) => {
  return (
    <Flex
      direction="col"
      gap="none"
      items="start"
      className={cn("w-full", className)}
    >
      <Flex items="center" gap="sm" className="w-full">
        <p className="text-xs font-medium text-zinc-800 dark:text-white md:text-sm">
          {label}
          {isOptional && (
            <span className="font-medium text-zinc-500"> (Optional)</span>
          )}
        </p>
        {extra && extra()}
      </Flex>
      {children && (
        <p className="text-xs leading-5 text-zinc-500">{children}</p>
      )}
    </Flex>
  );
};

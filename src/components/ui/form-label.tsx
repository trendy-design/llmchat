import { cn } from "@/helper/clsx";
import Link from "next/link";
import { Flex } from "./flex";
import { Type } from "./text";

export type TFormLabel = {
  children?: React.ReactNode;
  className?: string;
  link?: string;
  linkText?: string;
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
  linkText,
  link,
}: TFormLabel) => {
  return (
    <Flex
      direction="col"
      gap="none"
      items="start"
      className={cn("w-full", className)}
    >
      <Flex items="center" gap="sm" className="w-full">
        <Type size="sm" textColor="secondary" weight="medium">
          {label}
          {isOptional && (
            <span className="font-medium text-zinc-500"> (Optional)</span>
          )}
        </Type>
        {link && (
          <Link
            href={link}
            target="_blank"
            className="py-0.5 text-sm font-medium text-zinc-500 underline decoration-zinc-500/20 underline-offset-4 hover:opacity-90"
          >
            {linkText}
          </Link>
        )}
        {extra && extra()}
      </Flex>
      {children && (
        <Type size="sm" textColor="secondary" weight="medium">
          {children}
        </Type>
      )}
    </Flex>
  );
};
import { Flex, Spinner, Type } from "@/ui";
import { LucideIcon } from "lucide-react";

export type ToolBadgeProps = {
  icon: LucideIcon;
  isLoading?: boolean;
  loadingPlaceholder?: string;
  text: string;
};

export const ToolBadge = ({
  icon,
  isLoading,
  loadingPlaceholder,
  text,
}: ToolBadgeProps) => {
  const Icon = icon;
  return (
    <Flex items="center" gap="sm" className="rounded-full">
      {isLoading ? (
        <Spinner />
      ) : (
        <Icon size={16} strokeWidth={2} className="text-zinc-500" />
      )}
      <Type size="sm" textColor="secondary">
        {isLoading ? loadingPlaceholder : text}
      </Type>
    </Flex>
  );
};

import { HugeIcon } from "@/types/icons";
import { Flex, Spinner, Type } from "../ui";

export type ToolBadgeProps = {
  icon: HugeIcon;
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
      <Type size="base" textColor="secondary">
        {isLoading ? loadingPlaceholder : text}
      </Type>
    </Flex>
  );
};

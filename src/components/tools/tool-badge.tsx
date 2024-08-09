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
    <Flex
      items="center"
      gap="sm"
      className="rounded-full bg-zinc-500/10 px-3 py-1.5"
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <Icon size={14} strokeWidth={2} className="text-zinc-500" />
      )}
      <Type size="sm" textColor="secondary">
        {isLoading ? loadingPlaceholder : text}
      </Type>
    </Flex>
  );
};

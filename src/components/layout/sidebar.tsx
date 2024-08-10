import { PlusSignIcon } from "@/components/ui/icons";
import { useSessions } from "@/context";
import { HistorySidebar } from "../history/history-side-bar";

import { ModelIcon } from "@/components/model-icon";
import { Badge, Button, Flex, Tooltip } from "@/components/ui";
import { HugeIcon } from "@/types/icons";
import { useRouter } from "next/navigation";
import { ProfileDropdown } from "./profile-dropdown";

export const SidebarItem = ({
  tooltip,
  icon,
  onClick,
}: {
  tooltip: string;
  icon: HugeIcon;
  onClick: () => void;
}) => {
  if (!icon) return null;
  const Icon = icon;
  return (
    <Tooltip content={tooltip} side="bottom" sideOffset={4}>
      <Button size="iconSm" variant="ghost" onClick={onClick}>
        <Icon size={18} strokeWidth={2} />
      </Button>
    </Tooltip>
  );
};

export const Sidebar = () => {
  const { push } = useRouter();
  const { createSession } = useSessions();

  return (
    <div className="group fixed left-0 right-0 top-0 z-10 flex w-full flex-row items-center justify-center gap-2.5 border-zinc-500/10 py-2 pl-4 pr-2 dark:border-zinc-500/5 md:border-r">
      <Flex
        direction="row"
        items="center"
        gap="sm"
        onClick={() => push("/")}
        className="cursor-pointer"
      >
        <ModelIcon type="llmchatlogo" size="xs" rounded={false} />
        <Badge>Beta</Badge>
      </Flex>

      <SidebarItem
        tooltip="New Session"
        icon={PlusSignIcon}
        onClick={() => {
          push("/chat");
          createSession();
        }}
      />

      <Flex className="flex-1" />
      <HistorySidebar />

      <ProfileDropdown />
    </div>
  );
};

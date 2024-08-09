import { PlusSignIcon } from "@/components/ui/icons";
import { useSessions } from "@/context";
import { HistorySidebar } from "../history/history-side-bar";

import { ModelIcon } from "@/components/model-icon";
import { Badge, Button, Flex, Tooltip } from "@/components/ui";
import { HugeIcon } from "@/types/icons";
import { FolderLibraryIcon, Settings03Icon } from "@hugeicons/react";
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
    <Tooltip content={tooltip} side="left" sideOffset={4}>
      <Button size="iconSm" variant="ghost" onClick={onClick}>
        <Icon size={20} strokeWidth={2} />
      </Button>
    </Tooltip>
  );
};

export const Sidebar = () => {
  const { push } = useRouter();
  const { createSession } = useSessions();

  return (
    <div className="group fixed z-10 flex w-full flex-row items-center justify-center gap-2.5 border-zinc-500/10 p-2.5 dark:border-zinc-500/5 md:h-screen md:w-auto md:flex-col md:border-r">
      <Flex
        direction="col"
        items="center"
        gap="sm"
        onClick={() => push("/")}
        className="cursor-pointer"
      >
        <ModelIcon type="llmchatlogo" size="sm" />
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

      <HistorySidebar />
      <SidebarItem
        tooltip="Spaces (coming soon)"
        icon={FolderLibraryIcon}
        onClick={() => {}}
      />

      <Flex className="flex-1" />
      <SidebarItem
        tooltip="Settings"
        icon={Settings03Icon}
        onClick={() => push("/settings")}
      />
      <ProfileDropdown />
    </div>
  );
};

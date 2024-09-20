import { LucideIcon } from "@/lib/types/icons";
import { BetaTag, Button, Flex, Tooltip } from "@/ui";
import { Bolt, MessageSquare } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ModelIcon } from "../model-icon";
import { ProfileDropdown } from "./profile-dropdown";

export const NavbarItem = ({
  tooltip,
  icon,
  isActive,
  onClick,
}: {
  tooltip: string;
  icon: LucideIcon;
  isActive?: boolean;
  onClick: () => void;
}) => {
  if (!icon) return null;
  const Icon = icon;
  return (
    <Tooltip content={tooltip} side="right" sideOffset={4}>
      <Button
        size="iconSm"
        variant={isActive ? "bordered" : "ghost"}
        onClick={onClick}
      >
        <Icon size={18} strokeWidth={2} />
      </Button>
    </Tooltip>
  );
};

export const Sidebar = () => {
  const { push } = useRouter();
  const pathname = usePathname();

  return (
    <div className="group z-10 flex h-screen flex-col items-center justify-center gap-2 px-3 py-5">
      <Flex
        direction="col"
        items="center"
        gap="sm"
        onClick={() => push("/")}
        className="cursor-pointer"
      >
        <ModelIcon type="llmchatlogo" size="xs" rounded={false} />
        <BetaTag />
      </Flex>

      <NavbarItem
        tooltip="Chats"
        icon={MessageSquare}
        onClick={() => {
          push("/chat");
        }}
        isActive={pathname.includes("/chat")}
      />

      <NavbarItem
        tooltip="Settings"
        icon={Bolt}
        isActive={pathname.includes("/settings")}
        onClick={() => {
          push("/settings/common");
        }}
      />

      <Flex className="flex-1" />

      {/* <Flex direction="row" items="center" gap="none">
        <HistorySidebar />
      </Flex> */}
      <ProfileDropdown />
    </div>
  );
};

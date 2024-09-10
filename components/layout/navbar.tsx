import { useSessions } from "@/lib/context";
import { HistorySidebar } from "../history/history-side-bar";

import { LucideIcon } from "@/lib/types/icons";
import { BetaTag, Button, Flex, Tooltip } from "@/ui";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFeedback } from "../feedback/use-feedback";
import { ModelIcon } from "../model-icon";
import { ProfileDropdown } from "./profile-dropdown";

export const NavbarItem = ({
  tooltip,
  icon,
  onClick,
}: {
  tooltip: string;
  icon: LucideIcon;
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

export const Navbar = () => {
  const { push } = useRouter();
  const { createSession } = useSessions();
  const { setOpen, renderModal } = useFeedback();

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
        <BetaTag />
      </Flex>

      <NavbarItem
        tooltip="New Session"
        icon={Plus}
        onClick={() => {
          push("/chat");
          createSession();
        }}
      />

      <Flex className="flex-1" />
      <Button
        size="sm"
        variant="bordered"
        onClick={() => {
          setOpen(true);
        }}
      >
        Feedback
      </Button>
      <Flex direction="row" items="center" gap="none">
        <HistorySidebar />
      </Flex>
      <ProfileDropdown />
      {renderModal()}
    </div>
  );
};

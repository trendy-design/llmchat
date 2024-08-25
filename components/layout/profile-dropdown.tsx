import { constants } from "@/config";
import { useAuth } from "@/lib/context";
import { LucideIcon } from "@/lib/types/icons";
import { cn } from "@/lib/utils/clsx";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Flex,
  Tooltip,
  Type,
} from "@/ui";
import Avatar from "boring-avatars";
import {
  Bolt,
  CircleHelp,
  Flag,
  Github,
  LogOut,
  Moon,
  Sun,
  Twitter,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { useFeedback } from "../feedback/use-feedback";

export const ProfileDropdownItem = ({
  label,
  onClick,
  icon,
  key,
}: {
  label: string;
  onClick: () => void;
  icon: LucideIcon;
  key?: string;
}) => {
  const Icon = icon;
  return (
    <DropdownMenuItem key={key} onClick={onClick}>
      <Icon size={16} strokeWidth="2" />
      {label}
    </DropdownMenuItem>
  );
};

export type ProfileDropdownProps = {
  className?: string;
};

export const ProfileDropdown: FC<ProfileDropdownProps> = ({ className }) => {
  const { push } = useRouter();
  const { theme, setTheme } = useTheme();
  const { open: openSignIn, logout, user } = useAuth();

  const { renderModal, setOpen: openFeedback } = useFeedback();

  const menuItems = [
    {
      label: "Settings",
      onClick: () => {
        push("/settings/common");
      },
      icon: Bolt,
    },
    {
      label: "Feedback",
      onClick: () => {
        openFeedback(true);
      },
      icon: Flag,
    },
    {
      label: "Support",
      onClick: () => {
        window.open("mailto:support@llmchat.co", "_blank");
      },
      icon: CircleHelp,
    },
  ];

  return (
    <>
      <DropdownMenu>
        <Tooltip content="More" side="bottom" sideOffset={4}>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "cursor-pointer rounded-full p-0.5 outline-none ring-2 ring-zinc-500/20 hover:ring-zinc-500/30 focus:outline-none focus:ring-zinc-500/30",
                className,
              )}
            >
              <Avatar
                name={user?.email || "LLMChat"}
                variant="marble"
                size={24}
                colors={constants.avatarColors}
              />
            </div>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent
          className="min-w-[250px] p-1 text-sm md:text-base"
          align="end"
          side="bottom"
          sideOffset={4}
        >
          {user ? (
            <Flex className="items-center p-2" gap="md">
              <Avatar
                name={user?.email || "LLMChat"}
                variant="beam"
                size={24}
                colors={["#4A2BE2", "#D5EC77", "#3EE2DE", "#AF71FF", "#F882B3"]}
              />

              <Type size="sm" weight="medium" className="line-clamp-1">
                {user?.email}
              </Type>
            </Flex>
          ) : (
            <Flex className="p-1">
              <Button
                onClick={openSignIn}
                rounded="full"
                size="sm"
                className="w-full"
              >
                Sign In
              </Button>
            </Flex>
          )}
          <DropdownMenuSeparator />

          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <ProfileDropdownItem
                key={item.label}
                label={item.label}
                onClick={item.onClick}
                icon={Icon}
              />
            );
          })}
          <DropdownMenuSeparator />
          <ProfileDropdownItem
            label="Twitter"
            onClick={() => {
              window.open("https://x.com/llmchat_co", "_blank");
            }}
            icon={Twitter}
          />
          <ProfileDropdownItem
            label="Github"
            onClick={() => {
              window.open("https://git.new/llmchat", "_blank");
            }}
            icon={Github}
          />
          <DropdownMenuSeparator />

          <ProfileDropdownItem
            key={`theme-${theme}`}
            label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            onClick={() => {
              setTheme(theme === "light" ? "dark" : "light");
            }}
            icon={theme === "light" ? Moon : Sun}
          />

          {user && (
            <ProfileDropdownItem
              label="Logout"
              onClick={logout}
              icon={LogOut}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderModal()}
    </>
  );
};

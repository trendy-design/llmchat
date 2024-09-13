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
import Avvvatars from "avvvatars-react";
import {
  Bolt,
  CircleHelp,
  Github,
  LogOut,
  Moon,
  Sun,
  Twitter,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { FC } from "react";

export const ProfileDropdownItem = ({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: LucideIcon;
}) => {
  const Icon = icon;
  return (
    <DropdownMenuItem onClick={onClick}>
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

  const menuItems = [
    {
      label: "Settings",
      onClick: () => {
        push("/settings/common");
      },
      icon: Bolt,
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
              <Avvvatars
                value={user?.email || "LLMChat"}
                style={user?.email ? "character" : "shape"}
                size={24}
              />
            </div>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent
          className="min-w-[250px] p-1.5 text-sm md:text-base"
          align="end"
          side="bottom"
          sideOffset={4}
        >
          {user ? (
            <Flex className="items-center p-2" gap="md">
              <Avvvatars
                value={user?.email || "LLMChat"}
                style={user?.email ? "character" : "shape"}
                size={24}
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
          <DropdownMenuSeparator className="my-1.5" />

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
          <DropdownMenuSeparator className="my-1.5" />
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
    </>
  );
};

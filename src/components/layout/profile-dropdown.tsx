import { constants } from "@/config";
import { useAuth } from "@/context/auth";
import { cn } from "@/helper/clsx";
import { HugeIcon } from "@/types/icons";
import {
  Comment01Icon,
  Github01Icon,
  HelpCircleIcon,
  Logout01Icon,
  Moon02Icon,
  Sun01Icon,
  TwitterIcon,
} from "@hugeicons/react";
import Avatar from "boring-avatars";
import { useTheme } from "next-themes";
import { FC } from "react";
import { useFeedback } from "../feedback/use-feedback";
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
} from "../ui";

export const ProfileDropdownItem = ({
  label,
  onClick,
  icon,
  key,
}: {
  label: string;
  onClick: () => void;
  icon: HugeIcon;
  key?: string;
}) => {
  const Icon = icon;
  return (
    <DropdownMenuItem key={key} onClick={onClick}>
      <Icon size={18} variant="stroke" strokeWidth="2" />
      {label}
    </DropdownMenuItem>
  );
};

export type ProfileDropdownProps = {
  className?: string;
};

export const ProfileDropdown: FC<ProfileDropdownProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  const { open: openSignIn, logout, user } = useAuth();

  const { renderModal, setOpen: openFeedback } = useFeedback();

  const menuItems = [
    {
      label: "Feedback",
      onClick: () => {
        openFeedback(true);
      },
      icon: Comment01Icon,
    },
    { label: "Support", onClick: () => {}, icon: HelpCircleIcon },
  ];

  return (
    <>
      <DropdownMenu>
        <Tooltip content="More" side="left" sideOffset={4}>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "cursor-pointer rounded-full p-1 outline-none ring-2 ring-zinc-500/20 hover:ring-zinc-500/30 focus:outline-none focus:ring-zinc-500/30",
                className,
              )}
            >
              <Avatar
                name={user?.email || "LLMChat"}
                variant="beam"
                size={28}
                colors={constants.avatarColors}
              />
            </div>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent
          className="mr-2 min-w-[250px] p-1 text-sm md:text-base"
          align="end"
          side="left"
          sideOffset={4}
        >
          <Flex className="items-center p-2" gap="md">
            <Avatar
              name={user?.email || "LLMChat"}
              variant="beam"
              size={24}
              colors={["#4A2BE2", "#D5EC77", "#3EE2DE", "#AF71FF", "#F882B3"]}
            />
            {user ? (
              <Type size="sm" weight="medium" className="line-clamp-1">
                {user?.email}
              </Type>
            ) : (
              <Button onClick={openSignIn} rounded="full" size="sm">
                Sign In
              </Button>
            )}
          </Flex>

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
            onClick={() => {}}
            icon={TwitterIcon}
          />
          <ProfileDropdownItem
            label="Github"
            onClick={() => {}}
            icon={Github01Icon}
          />
          <DropdownMenuSeparator />

          <ProfileDropdownItem
            key={`theme-${theme}`}
            label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            onClick={() => {
              setTheme(theme === "light" ? "dark" : "light");
            }}
            icon={theme === "light" ? Moon02Icon : Sun01Icon}
          />

          {user && (
            <ProfileDropdownItem
              label="Logout"
              onClick={logout}
              icon={Logout01Icon}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderModal()}
    </>
  );
};

"use client";
import { SettingsTopNav } from "@/components/chat-input/settings-top-nav";
import { useRootContext } from "@/libs/context/root";
import { LucideIcon } from "@/libs/types/icons";
import { Flex } from "@/ui";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export type TSettingMenu = {
  name: string;
  icon: LucideIcon;
  route: string;
};

export default function SettingsPage({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { setIsMobileSidebarOpen } = useRootContext();
  const { push } = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileSidebarOpen(false);
    if (pathname === "/settings") {
      push("/settings/common");
    }
  }, [pathname]);

  return (
    <Flex
      justify="center"
      className="no-scrollbar h-full w-full overflow-y-auto"
    >
      <SettingsTopNav />
      <Flex className="relative w-[720px]">
        <Flex className="w-full px-4 pt-16 md:p-8">{children}</Flex>
      </Flex>
    </Flex>
  );
}

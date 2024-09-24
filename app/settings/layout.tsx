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
      direction="col"
      className="relative h-full w-full bg-white"
    >
      <SettingsTopNav />

      <Flex className="no-scrollbar h-full w-full flex-grow justify-center overflow-y-auto pb-24">
        <Flex className="relative w-[700px]">
          <Flex className="w-full px-4 pt-8 md:p-8">{children}</Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

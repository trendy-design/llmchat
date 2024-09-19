"use client";
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
  const { push } = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/settings") {
      push("/settings/common");
    }
  }, [pathname]);

  return (
    <Flex className="p-1">
      <Flex justify="center" className="rounded-lg">
        <Flex className="relative w-[720px]">
          <Flex className="no-scrollbar w-full flex-1 overflow-y-auto p-4">
            {children}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

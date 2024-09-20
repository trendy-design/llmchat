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
    <Flex
      justify="center"
      className="no-scrollbar h-full w-full overflow-y-auto"
    >
      <Flex className="relative w-[720px]">
        <Flex className="w-full p-8">{children}</Flex>
      </Flex>
    </Flex>
  );
}

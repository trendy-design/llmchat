import { SettingsTabs } from "@/components/layout/settings-tabs";
import { TopNav } from "@/components/layout/top-nav";
import { Flex } from "@repo/ui";

export const SettingsTopNav = () => {
  return (
    <Flex direction="col" className="w-full">
      <TopNav title="Settings" showBackButton borderBottom={false} />
      <Flex
        direction="row"
        className="w-full border-b bg-zinc-25 px-2 pt-0 dark:bg-zinc-800"
      >
        <SettingsTabs />
      </Flex>
    </Flex>
  );
};

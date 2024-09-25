"use client";

import { SettingCard } from "@/components/settings/setting-card";
import { SettingsContainer } from "@/components/settings/settings-container";
import { usePreferenceContext } from "@/lib/context";
import { Button, Flex, Type } from "@/ui";
import { Layers, Trash } from "lucide-react";

export default function MemorySettings() {
  const { updatePreferences, preferences } = usePreferenceContext();

  const renderMemory = (memory: string) => {
    return (
      <SettingCard className="flex flex-row items-center py-2 pl-4 pr-2">
        <Type size="sm" className="flex-1">
          {memory}
        </Type>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            updatePreferences({
              memories: preferences?.memories?.filter((m) => m !== memory),
            });
          }}
        >
          <Trash size={16} strokeWidth={2} />
        </Button>
      </SettingCard>
    );
  };

  const renderEmptyState = () => {
    return (
      <Flex
        direction="col"
        items="center"
        gap="none"
        className="w-full rounded-lg bg-zinc-50/50 p-4 dark:bg-white/5"
      >
        <Layers size={20} strokeWidth={2} className="mb-2 text-zinc-500" />
        <Type size="sm" textColor="secondary">
          No memories
        </Type>
        <Type size="xs" textColor="tertiary">
          Use memory plugin to get started
        </Type>
      </Flex>
    );
  };
  return (
    <SettingsContainer title="Memory">
      {!preferences?.memories?.length && renderEmptyState()}
      <Flex direction="col" gap="xs" className="w-full">
        {preferences?.memories?.map(renderMemory)}
      </Flex>
    </SettingsContainer>
  );
}

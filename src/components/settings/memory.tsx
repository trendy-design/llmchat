import { Button } from "@/components/ui/button";
import { Type } from "@/components/ui/text";
import { usePreferenceContext } from "@/context/preferences";
import { Delete01Icon } from "@hugeicons/react";
import { SettingCard } from "./setting-card";
import { SettingsContainer } from "./settings-container";

export const MemorySettings = () => {
  const { updatePreferences, preferences } = usePreferenceContext();

  const renderMemory = (memory: string) => {
    return (
      <SettingCard className="flex flex-row items-center py-1 px-3">
        <Type size="sm" className="flex-1">
          {memory}
        </Type>
        <Button
          variant="ghost"
          size="iconXS"
          onClick={() => {
            updatePreferences({
              memories: preferences?.memories?.filter((m) => m !== memory),
            });
          }}
        >
          <Delete01Icon size={16} strokeWidth={1.2} />
        </Button>
      </SettingCard>
    );
  };
  return (
    <SettingsContainer title="Memory">
      {preferences?.memories?.map(renderMemory)}
    </SettingsContainer>
  );
};

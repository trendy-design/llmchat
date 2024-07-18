import { usePreferenceContext } from "@/context/preferences";
import { Flex } from "@/components/ui/flex";
import { Switch } from "@/components/ui/switch";
import { Type } from "@/components/ui/text";
import { SettingCard } from "./setting-card";
import { SettingsContainer } from "./settings-container";

export const VoiceInput = () => {
  const { updatePreferences, preferences } = usePreferenceContext();
  return (
    <SettingsContainer title="Speech-to-Text Settings">
      <SettingCard className="justify-center flex flex-col p-3">
        <Flex justify="between" items="center">
          <Flex direction="col" items="start">
            <Type textColor="primary" weight="medium">
              Enable Whisper Speech-to-Text
            </Type>
            <Type size="xs" textColor="tertiary">
              OpenAI API key required.
            </Type>
          </Flex>
          <Switch
            checked={preferences?.whisperSpeechToTextEnabled}
            onCheckedChange={(checked) => {
              updatePreferences({ whisperSpeechToTextEnabled: checked });
            }}
          />
        </Flex>
      </SettingCard>
    </SettingsContainer>
  );
};

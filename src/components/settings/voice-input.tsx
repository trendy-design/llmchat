import { usePreferenceContext } from "@/context/preferences/context";
import { Flex } from "../ui/flex";
import { Switch } from "../ui/switch";
import { Type } from "../ui/text";
import { SettingCard } from "./setting-card";
import { SettingsContainer } from "./settings-container";

export const VoiceInput = () => {
  const { setPreferencesMutation, preferencesQuery } = usePreferenceContext();
  return (
    <SettingsContainer title="Speech-to-Text Settings">
      <SettingCard className="justify-center flex flex-col p-3">
        <Flex justify="between" items="center">
          <Flex direction="col" items="start">
            <Type textColor="primary">Enable Whisper Speech-to-Text</Type>
            <Type size="xs" textColor="tertiary">
              OpenAI API key required.
            </Type>
          </Flex>
          <Switch
            checked={preferencesQuery?.data?.whisperSpeechToTextEnabled}
            onCheckedChange={(checked) => {
              setPreferencesMutation.mutate({
                whisperSpeechToTextEnabled: checked,
              });
            }}
          />
        </Flex>
      </SettingCard>
    </SettingsContainer>
  );
};

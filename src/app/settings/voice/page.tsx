"use client";

import { SettingCard } from "@/components/settings/setting-card";
import { SettingsContainer } from "@/components/settings/settings-container";
import { Flex } from "@/components/ui/flex";
import { Switch } from "@/components/ui/switch";
import { Type } from "@/components/ui/text";
import { usePreferenceContext } from "@/context/preferences";

export default function VoiceSettings() {
  const { updatePreferences, preferences } = usePreferenceContext();
  return (
    <SettingsContainer title="Speech-to-Text Settings">
      <SettingCard className="justify-center flex flex-col p-5">
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
}

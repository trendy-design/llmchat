"use client";

import { SettingCard } from "@/components/settings/setting-card";
import { SettingsContainer } from "@/components/settings/settings-container";
import { usePreferenceContext } from "@/lib/context";
import { Flex, Switch, Type } from "@/ui";

export default function VoiceSettings() {
  const { updatePreferences, preferences } = usePreferenceContext();
  return (
    <SettingsContainer title="Voice Settings">
      <SettingCard className="flex flex-col justify-center p-5">
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

import { usePreferenceContext } from "@/context/preferences";
import { TPreferences, defaultPreferences } from "@/hooks/use-preferences";
import { ArrowClockwise, Info } from "@phosphor-icons/react";
import { ChangeEvent } from "react";
import { Button } from "../ui/button";
import { Flex } from "../ui/flex";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Type } from "../ui/text";
import { Textarea } from "../ui/textarea";
import { SettingCard } from "./setting-card";
import { SettingsContainer } from "./settings-container";

export const CommonSettings = () => {
  const { preferences, updatePreferences } = usePreferenceContext();

  const renderResetToDefault = (key: keyof TPreferences) => {
    return (
      <Button
        variant="outline"
        size="iconXS"
        rounded="lg"
        onClick={() => {
          updatePreferences({ [key]: defaultPreferences[key] });
        }}
      >
        <ArrowClockwise size={14} weight="bold" />
      </Button>
    );
  };

  const onInputChange = (min: number, max: number, key: keyof TPreferences) => {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      if (value < min) {
        updatePreferences({ [key]: min });
        return;
      } else if (value > max) {
        updatePreferences({ [key]: max });
        return;
      }
      updatePreferences({ [key]: value });
    };
  };

  const onSliderChange = (
    min: number,
    max: number,
    key: keyof TPreferences
  ) => {
    return (value: number[]) => {
      if (value?.[0] < min) {
        updatePreferences({ [key]: min });
        return;
      } else if (value?.[0] > max) {
        updatePreferences({ [key]: max });
        return;
      }
      updatePreferences({ [key]: value?.[0] });
    };
  };

  return (
    <SettingsContainer title="Model Settings">
      <Flex direction="col" gap="sm" className="w-full" items="start">
        <Type
          size="xs"
          textColor="secondary"
          className="flex flex-row items-center gap-1"
        >
          System Default Prompt <Info weight="regular" size={14} />
        </Type>

        <Textarea
          name="systemPrompt"
          value={preferences.systemPrompt}
          autoComplete="off"
          onChange={(e) => {
            updatePreferences({ systemPrompt: e.target.value });
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            updatePreferences({
              systemPrompt: defaultPreferences.systemPrompt,
            });
          }}
        >
          Reset System Prompt
        </Button>
      </Flex>

      <SettingCard className="p-3 mt-2">
        <Flex justify="between">
          <Flex direction="col" items="start">
            <Type weight="medium">Context Length</Type>
            <Type size="xxs" textColor="secondary">
              Number of previous messages to use as context
            </Type>
          </Flex>
          <Flex items="center" gap="sm">
            <Input
              name="messageLimit"
              type="number"
              size="sm"
              className="w-[100px]"
              value={preferences?.messageLimit}
              autoComplete="off"
              onChange={(e) => {
                updatePreferences({
                  messageLimit: Number(e.target.value),
                });
              }}
            />
            {renderResetToDefault("messageLimit")}
          </Flex>
        </Flex>
        <div className="my-3 h-[1px] bg-zinc-500/10 w-full" />

        <Flex justify="between">
          <Flex direction="col" items="start">
            <Type weight="medium">Max output tokens</Type>
            <Type size="xxs" textColor="secondary">
              Maximum number of tokens to generate
            </Type>
          </Flex>
          <Flex items="center" gap="sm">
            <Input
              name="maxTokens"
              type="number"
              size="sm"
              className="w-[100px]"
              value={preferences?.maxTokens}
              autoComplete="off"
              onChange={(e) => {
                updatePreferences({
                  maxTokens: Number(e.target.value),
                });
              }}
            />
            {renderResetToDefault("maxTokens")}
          </Flex>
        </Flex>
        <div className="my-3 h-[1px] bg-zinc-500/10 w-full" />

        <Flex justify="between">
          <Flex direction="col" items="start">
            <Type weight="medium">Temprature</Type>
            <Type size="xxs" textColor="secondary">
              Maximum number of tokens to generate
            </Type>
          </Flex>
          <Flex items="center" gap="sm">
            <Slider
              className="my-2 w-[80px]"
              value={[Number(preferences?.temperature)]}
              min={0}
              step={0.1}
              max={1}
              onValueChange={onSliderChange(0, 1, "temperature")}
            />
            <Input
              name="temperature"
              type="number"
              size="sm"
              className="w-[80px]"
              value={preferences?.temperature}
              min={0}
              step={1}
              max={100}
              autoComplete="off"
              onChange={onInputChange(0, 1, "temperature")}
            />
            {renderResetToDefault("temperature")}
          </Flex>
        </Flex>
        <div className="my-3 h-[1px] bg-zinc-500/10 w-full" />

        <Flex justify="between">
          <Flex direction="col" items="start">
            <Type weight="medium">TopP</Type>
            <Type size="xxs" textColor="secondary">
              Maximum number of tokens to generate
            </Type>
          </Flex>
          <Flex items="center" gap="sm">
            <Slider
              className="my-2 w-[80px]"
              value={[Number(preferences.topP)]}
              min={0}
              step={0.01}
              max={1}
              onValueChange={onSliderChange(0, 1, "topP")}
            />
            <Input
              name="topP"
              type="number"
              size="sm"
              className="w-[80px]"
              value={preferences.topP}
              min={0}
              step={1}
              max={1}
              autoComplete="off"
              onChange={onInputChange(0, 1, "topP")}
            />
            {renderResetToDefault("topP")}
          </Flex>
        </Flex>
        <div className="my-3 h-[1px] bg-zinc-500/10 w-full" />

        <Flex justify="between">
          <Flex direction="col" items="start">
            <Type weight="medium">TopK</Type>
            <Type size="xxs" textColor="secondary">
              Maximum number of tokens to generate
            </Type>
          </Flex>
          <Flex items="center" gap="sm">
            <Slider
              className="my-2 w-[80px]"
              value={[Number(preferences.topK)]}
              min={1}
              step={1}
              max={100}
              onValueChange={onSliderChange(1, 100, "topK")}
            />
            <Input
              name="topK"
              type="number"
              size="sm"
              className="w-[80px]"
              value={preferences.topK}
              min={0}
              step={1}
              max={100}
              autoComplete="off"
              onChange={onInputChange(1, 100, "topK")}
            />
            {renderResetToDefault("topK")}
          </Flex>
        </Flex>
      </SettingCard>
    </SettingsContainer>
  );
};

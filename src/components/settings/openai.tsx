import { useLLMTest } from "@/hooks/use-llm-test";
import { usePreferences } from "@/hooks/use-preferences";
import { ArrowRight, Info } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SettingsContainer } from "./settings-container";

export const OpenAISettings = () => {
  const [key, setKey] = useState<string>("");
  const { getApiKey, setApiKey } = usePreferences();
  const { renderSaveApiKeyButton } = useLLMTest();
  useEffect(() => {
    getApiKey("openai").then((key) => {
      if (key) {
        setKey(key);
      }
    });
  }, []);
  return (
    <SettingsContainer title="OpenAI Settings">
      <div className="flex flex-row items-end justify-between">
        <p className="text-sm md:text-base  text-zinc-500">Open AI API Key</p>
      </div>
      <Input
        placeholder="Sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        value={key}
        type="password"
        autoComplete="off"
        onChange={(e) => {
          setKey(e.target.value);
        }}
      />

      <div className="flex flex-row items-center gap-2">
        {renderSaveApiKeyButton("openai", key, () => {
          setApiKey("openai", key);
        })}

        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            window.open(
              "https://platform.openai.com/account/api-keys",
              "_blank"
            );
          }}
        >
          Get your API key here <ArrowRight size={16} weight="bold" />
        </Button>
      </div>

      <div className="flex flex-row items-start gap-1 py-2 text-zinc-500">
        <Info size={16} weight="bold" />
        <p className=" text-xs">
          Your API Key is stored locally on your browser and never sent anywhere
          else.
        </p>
      </div>
    </SettingsContainer>
  );
};

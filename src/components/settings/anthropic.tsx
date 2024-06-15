import { usePreferenceContext } from "@/context/preferences/provider";
import { useLLMTest } from "@/hooks/use-llm-test";
import { ArrowRight, Info } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SettingsContainer } from "./settings-container";

export const AnthropicSettings = () => {
  const [key, setKey] = useState<string>("");
  const { apiKeys, updateApiKey } = usePreferenceContext();
  const { renderSaveApiKeyButton } = useLLMTest();

  useEffect(() => {
    setKey(apiKeys.anthropic || "");
  }, [apiKeys.anthropic]);
  return (
    <SettingsContainer title="Anthropic Settings">
      <div className="flex flex-row items-end justify-between">
        <p className="text-xs md:text-sm  text-zinc-500">Anthropic API Key</p>
      </div>
      <Input
        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        value={key}
        type="password"
        autoComplete="off"
        onChange={(e) => {
          setKey(e.target.value);
        }}
      />
      <div className="flex flex-row items-center gap-2">
        {key &&
          key !== apiKeys?.anthropic &&
          renderSaveApiKeyButton("anthropic", key, () => {
            updateApiKey("anthropic", key);
          })}
        {apiKeys?.anthropic && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setKey("");
              updateApiKey("anthropic", "");
            }}
          >
            Remove API Key
          </Button>
        )}

        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            window.open(
              "https://console.anthropic.com/settings/keys",
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

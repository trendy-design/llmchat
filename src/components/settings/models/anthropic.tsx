import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { usePreferenceContext } from "@/context/preferences";
import { useLLMTest } from "@/hooks/use-llm-test";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiKeyInfo } from "./api-key-info";
import ApiKeyInput from "./api-key-input";

export const AnthropicSettings = () => {
  const [key, setKey] = useState<string>("");
  const { apiKeys, updateApiKey } = usePreferenceContext();
  const { checkApiKey, isCheckingApiKey } = useLLMTest();

  useEffect(() => {
    setKey(apiKeys.anthropic || "");
  }, [apiKeys.anthropic]);

  return (
    <Flex direction="col" gap="sm">
      <Flex items="center" gap="sm">
        <p className="text-xs md:text-sm font-medium text-zinc-300">
          Anthropic API Key
        </p>
        <Link
          href="https://console.anthropic.com/settings/keys"
          className="text-blue-400 font-medium"
        >
          (Get API key here)
        </Link>
      </Flex>
      <ApiKeyInput
        value={key}
        setValue={setKey}
        isDisabled={!!apiKeys.anthropic}
        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        isLocked={!!apiKeys.anthropic}
      />

      <div className="flex flex-row items-center gap-1">
        {!apiKeys.anthropic && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              checkApiKey({
                model: "anthropic",
                key,
                onValidated: () => {
                  updateApiKey("anthropic", key);
                },
                onError: () => {
                  setKey("");
                },
              });
            }}
          >
            {isCheckingApiKey ? "Checking..." : "Save Key"}
          </Button>
        )}

        {apiKeys?.anthropic && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setKey("");
              updateApiKey("anthropic", "");
            }}
          >
            Remove Key
          </Button>
        )}
      </div>
      <ApiKeyInfo />
    </Flex>
  );
};

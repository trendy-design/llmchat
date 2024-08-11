import { FormLabel } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { configs } from "@/config";
import { usePreferenceContext } from "@/context/preferences";
import { useLLMTest } from "@/hooks/use-llm-test";
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
    <Flex direction="col" gap="md">
      <FormLabel
        label="Anthropic API Key"
        link={configs.anthropicApiKeyUrl}
        linkText="Get API key here"
      />

      <ApiKeyInput
        value={key}
        setValue={setKey}
        isDisabled={!!apiKeys.anthropic}
        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        isLocked={!!apiKeys.anthropic}
      />

      <Flex gap="sm">
        {!apiKeys.anthropic && (
          <Button
            size="sm"
            variant="default"
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
      </Flex>
      <ApiKeyInfo />
    </Flex>
  );
};

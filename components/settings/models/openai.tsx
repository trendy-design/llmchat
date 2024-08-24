import { FormLabel } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { configs } from "@/config";
import { usePreferenceContext } from "@/lib/context";
import { useLLMTest } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { ApiKeyInfo } from "./api-key-info";
import ApiKeyInput from "./api-key-input";

export const OpenAISettings = () => {
  const [key, setKey] = useState<string>("");
  const { apiKeys, updateApiKey } = usePreferenceContext();
  const { checkApiKey, isCheckingApiKey } = useLLMTest();

  useEffect(() => {
    setKey(apiKeys.openai || "");
  }, [apiKeys.openai]);

  return (
    <Flex direction="col" gap="md">
      <FormLabel
        label="Open AI API Key"
        link={configs.openaiApiKeyUrl}
        linkText="Get API key here"
      />

      <ApiKeyInput
        value={key}
        setValue={setKey}
        isDisabled={!!apiKeys.openai}
        placeholder="Sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        isLocked={!!apiKeys.openai}
      />

      <div className="flex flex-row items-center gap-1">
        {!apiKeys.openai && (
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              checkApiKey({
                model: "openai",
                key,
                onValidated: () => {
                  updateApiKey("openai", key);
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

        {apiKeys?.openai && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setKey("");
              updateApiKey("openai", "");
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

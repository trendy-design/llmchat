import { FormLabel } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { configs } from "@/config";
import { usePreferenceContext } from "@/context/preferences";
import { useLLMTest } from "@/hooks/use-llm-test";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiKeyInfo } from "./api-key-info";
import ApiKeyInput from "./api-key-input";

export const GeminiSettings = () => {
  const [key, setKey] = useState<string>("");
  const { apiKeys, updateApiKey } = usePreferenceContext();
  const { checkApiKey, isCheckingApiKey } = useLLMTest();

  useEffect(() => {
    setKey(apiKeys.gemini || "");
  }, [apiKeys.gemini]);

  return (
    <Flex direction="col" gap="sm">
      <FormLabel
        label="Google Gemini API Key"
        extra={() => (
          <Link
            href={configs.geminiApiKeyUrl}
            className="text-sm font-medium text-blue-400 hover:opacity-90"
          >
            Get API key here
          </Link>
        )}
      />
      <ApiKeyInput
        value={key}
        setValue={setKey}
        isDisabled={!!apiKeys.gemini}
        placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
        isLocked={!!apiKeys.gemini}
      />

      <Flex gap="sm">
        {!apiKeys.gemini && (
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              checkApiKey({
                model: "gemini",
                key,
                onValidated: () => {
                  updateApiKey("gemini", key);
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

        {apiKeys?.gemini && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setKey("");
              updateApiKey("gemini", "");
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

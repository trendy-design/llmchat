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

export const GroqSettings = () => {
  const [key, setKey] = useState<string>("");
  const { apiKeys, updateApiKey } = usePreferenceContext();
  const { checkApiKey, isCheckingApiKey } = useLLMTest();

  useEffect(() => {
    setKey(apiKeys.groq || "");
  }, [apiKeys.groq]);

  return (
    <Flex direction="col" gap="md">
      <FormLabel
        label="Groq API Key"
        extra={() => (
          <Link
            href={configs.anthropicApiKeyUrl}
            target="_blank"
            className="text-sm font-medium text-blue-400 hover:opacity-90"
          >
            Get API key here
          </Link>
        )}
      />

      <ApiKeyInput
        value={key}
        setValue={setKey}
        isDisabled={!!apiKeys.groq}
        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        isLocked={!!apiKeys.groq}
      />

      <Flex gap="sm">
        {!apiKeys.groq && (
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              checkApiKey({
                model: "groq",
                key,
                onValidated: () => {
                  updateApiKey("groq", key);
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
              updateApiKey("groq", "");
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

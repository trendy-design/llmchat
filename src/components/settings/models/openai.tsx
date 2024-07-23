import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { configs } from "@/config";
import { usePreferenceContext } from "@/context/preferences";
import { useLLMTest } from "@/hooks/use-llm-test";
import Link from "next/link";
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
    <Flex direction="col" gap="sm">
      <Flex items="center" gap="sm">
        <p className="text-xs md:text-sm font-medium text-zinc-300">
          Open AI API Key
        </p>
        <Link
          href={configs.geminiApiKeyUrl}
          className="text-blue-400 font-medium"
        >
          (Get API key here)
        </Link>
      </Flex>
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
            variant="outline"
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

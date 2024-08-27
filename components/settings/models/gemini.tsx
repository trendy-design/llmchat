import { FormLabel } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { configs } from "@/config";
import { usePreferenceContext } from "@/lib/context";
import { useLLMTest } from "@/lib/hooks";
import plausible from "@/libs/utils/plausible";
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
        link={configs.geminiApiKeyUrl}
        linkText="Get API key here"
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
            variant="default"
            onClick={() => {
              checkApiKey({
                model: "gemini",
                key,
                onValidated: () => {
                  updateApiKey("gemini", key);
                  plausible.trackEvent("Api+Added", {
                    props: {
                      provider: "Gemini",
                    },
                  });
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

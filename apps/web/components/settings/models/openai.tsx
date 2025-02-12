import { usePreferenceContext } from "@/lib/context";
import { useLLMTest } from "@/lib/hooks";
import { configs } from "@repo/shared/config";
import { plausible } from "@repo/shared/utils";
import { Button, Flex, FormLabel } from "@repo/ui";
import { useEffect, useState } from "react";
import { ApiKeyInfo } from "./api-key-info";
import ApiKeyInput from "./api-key-input";

export const OpenAISettings = () => {
  const [key, setKey] = useState<string>("");
  const { getApiKey, updateApiKey } = usePreferenceContext();
  const { checkApiKey, isCheckingApiKey } = useLLMTest();

  const openaiKey = getApiKey("openai");

  useEffect(() => {
    setKey(openaiKey || "");
  }, [openaiKey]);

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
        isDisabled={!!openaiKey}
        placeholder="Sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        isLocked={!!openaiKey}
      />

      <div className="flex flex-row items-center gap-1">
        {!openaiKey && (
          <Button
            variant="default"
            onClick={() => {
              checkApiKey({
                model: "openai",
                key,
                onValidated: () => {
                  plausible.trackEvent("Api+Added", {
                    props: {
                      provider: "OpenAI",
                    },
                  });
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

        {openaiKey && (
          <Button
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

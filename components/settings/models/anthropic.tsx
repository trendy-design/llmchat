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

export const AnthropicSettings = () => {
  const [key, setKey] = useState<string>("");
  const { updateApiKey, getApiKey } = usePreferenceContext();
  const { checkApiKey, isCheckingApiKey } = useLLMTest();

  const anthropicKey = getApiKey("anthropic");

  useEffect(() => {
    setKey(anthropicKey || "");
  }, [anthropicKey]);

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
        isDisabled={!!anthropicKey}
        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        isLocked={!!anthropicKey}
      />

      <Flex gap="sm">
        {!anthropicKey && (
          <Button
            variant="default"
            onClick={() => {
              checkApiKey({
                model: "anthropic",
                key,
                onValidated: () => {
                  updateApiKey("anthropic", key);
                  plausible.trackEvent("Api+Added", {
                    props: {
                      provider: "Anthropic",
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

        {anthropicKey && (
          <Button
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

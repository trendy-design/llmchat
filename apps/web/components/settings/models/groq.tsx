import { usePreferenceContext } from "@/lib/context";
import { useLLMTest } from "@/lib/hooks";
import { configs } from "@repo/shared/config";
import { plausible } from "@repo/shared/utils";
import { Button, Flex, FormLabel } from "@repo/ui";
import { useEffect, useState } from "react";
import { ApiKeyInfo } from "./api-key-info";
import ApiKeyInput from "./api-key-input";

export const GroqSettings = () => {
  const [key, setKey] = useState<string>("");
  const { getApiKey, updateApiKey } = usePreferenceContext();
  const { checkApiKey, isCheckingApiKey } = useLLMTest();

  const groqKey = getApiKey("groq");

  useEffect(() => {
    setKey(groqKey || "");
  }, [groqKey]);

  return (
    <Flex direction="col" gap="md">
      <FormLabel
        label="Groq API Key"
        link={configs.groqApiKeyUrl}
        linkText="Get API key here"
      />

      <ApiKeyInput
        value={key}
        setValue={setKey}
        isDisabled={!!groqKey}
        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        isLocked={!!groqKey}
      />

      <Flex gap="sm">
        {!groqKey && (
          <Button
            variant="default"
            onClick={() => {
              checkApiKey({
                model: "groq",
                key,
                onValidated: () => {
                  updateApiKey("groq", key);
                  plausible.trackEvent("Api+Added", {
                    props: {
                      provider: "Groq",
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

        {groqKey && (
          <Button
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

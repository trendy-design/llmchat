import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { Input } from "@/components/ui/input";
import { usePreferenceContext } from "@/context/preferences";
import { useLLMTest } from "@/hooks/use-llm-test";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiKeyInfo } from "./api-key-info";

export const GeminiSettings = () => {
  const [key, setKey] = useState<string>("");
  const { apiKeys, updateApiKey } = usePreferenceContext();
  const { checkApiKey, isCheckingApiKey } = useLLMTest();

  useEffect(() => {
    setKey(apiKeys.gemini || "");
  }, [apiKeys.gemini]);

  return (
    <Flex direction="col" gap="sm">
      <Flex items="center" gap="sm">
        <p className="text-xs md:text-sm font-medium text-zinc-300">
          Google Gemini API Key
        </p>
        <Link
          href="https://aistudio.google.com/app/apikey"
          className="text-blue-400 font-medium"
        >
          (Get API key here)
        </Link>
      </Flex>
      <Input
        placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
        type="password"
        autoComplete="off"
        value={key}
        onChange={(e) => {
          setKey(e.target.value);
        }}
      />

      <div className="flex flex-row items-center gap-1">
        {!apiKeys.gemini && (
          <Button
            size="sm"
            variant="outline"
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
      </div>
      <ApiKeyInfo />
    </Flex>
  );
};

import { useLLMTest } from "@/hooks/use-llm-test";
import { usePreferences } from "@/hooks/use-preferences";
import { ArrowRight, Info } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const OpenAISettings = () => {
  const [key, setKey] = useState<string>("");
  const { getApiKey, setApiKey } = usePreferences();
  const { renderTestButton } = useLLMTest();
  useEffect(() => {
    getApiKey("openai").then((key) => {
      if (key) {
        setKey(key);
      }
    });
  }, []);
  return (
    <div className="px-6 flex flex-col items-start gap-2">
      <p className="text-md font-medium text-zinc-800 dark:text-white py-4">
        OpenAI Settings
      </p>

      <div className="flex flex-row items-end justify-between">
        <p className="text-xs  text-zinc-500">Open AI API Key</p>
      </div>
      <Input
        placeholder="Sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        value={key}
        type="password"
        autoComplete="off"
        onChange={(e) => {
          setKey(e.target.value);
          setApiKey("openai", e.target.value);
        }}
      />

      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          window.open("https://platform.openai.com/account/api-keys", "_blank");
        }}
      >
        Get your API key here <ArrowRight size={16} weight="bold" />
      </Button>
      {renderTestButton("openai")}
      <Alert variant="success">
        <Info className="h-4 w-4" />
        <AlertTitle>Attention!</AlertTitle>
        <AlertDescription>
          Your API Key is stored locally on your browser and never sent anywhere
          else.
        </AlertDescription>
      </Alert>
    </div>
  );
};

import { usePreferences } from "@/hooks/use-preferences";
import { ArrowRight, Info } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const AnthropicSettings = () => {
  const [key, setKey] = useState<string>("");
  const { getApiKey, setApiKey } = usePreferences();
  useEffect(() => {
    getApiKey("anthropic").then((key) => {
      if (key) {
        setKey(key);
      }
    });
  }, []);
  return (
    <div className="px-4 flex flex-col items-start gap-2">
      <p className="text-md font-medium text-white py-4">Anthropic Settings</p>

      <div className="flex flex-row items-end justify-between">
        <p className="text-xs  text-zinc-500">Anthropic API Key</p>
      </div>
      <Input
        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        value={key}
        onChange={(e) => {
          setKey(e.target.value);
          setApiKey("anthropic", e.target.value);
        }}
      />
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          window.open("https://console.anthropic.com/settings/keys", "_blank");
        }}
      >
        Get your API key here <ArrowRight size={16} weight="bold" />
      </Button>
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

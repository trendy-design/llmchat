import { FormLabel } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { Input } from "@/components/ui/input";
import { Mdx } from "@/components/ui/mdx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { docs } from "@/config";
import { usePreferenceContext } from "@/context/preferences";
import { useEffect, useState } from "react";

export const OllamaSettings = () => {
  const [url, setURL] = useState<string>("");
  const { preferences, updatePreferences } = usePreferenceContext();
  const { toast } = useToast();

  useEffect(() => {
    setURL(preferences.ollamaBaseUrl);
  }, [preferences]);

  const handleURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setURL(e.target.value);
  };

  const verifyAndSaveURL = async () => {
    try {
      const response = await fetch(url + "/api/tags");
      if (response.status === 200) {
        console.log(response);
        toast({
          title: "Success",
          description: "Ollama server endpoint is valid",
        });
        updatePreferences({ ollamaBaseUrl: url });
      } else {
        throw new Error("Response status is not 200");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Invalid Ollama server endpoint",
        variant: "destructive",
      });
    }
  };

  const tabConfigs = [
    { value: "macos", label: "Macos", message: docs.macosOllamaConfig },
    { value: "windows", label: "Windows", message: docs.windowsOllamaConfig },
  ];

  return (
    <Flex direction="col" gap="sm">
      <FormLabel label="Ollama local server URL" />
      <Input
        placeholder="http://localhost:11434"
        value={url}
        autoComplete="off"
        onChange={handleURLChange}
      />

      <Button size="sm" variant="default" onClick={verifyAndSaveURL}>
        Check Connection
      </Button>

      <Tabs defaultValue="macos" className="mt-2 w-full">
        <TabsList className="grid w-full grid-cols-2">
          {tabConfigs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabConfigs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="pb-4">
            <Mdx
              message={tab.message}
              animate={false}
              messageId="ollama-config"
              size="sm"
            />
          </TabsContent>
        ))}
      </Tabs>
    </Flex>
  );
};

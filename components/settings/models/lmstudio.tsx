import { FormLabel } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { Input } from "@/components/ui/input";
import { Mdx } from "@/components/ui/mdx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { docs } from "@/config";
import { usePreferenceContext } from "@/lib/context";
import plausible from "@/libs/utils/plausible";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type LmStudioSettingsProps = {
  onRefresh: () => void;
};

export const LmStudioSettings = ({ onRefresh }: LmStudioSettingsProps) => {
  const { push } = useRouter();
  const [url, setURL] = useState<string>("");
  const { preferences, updatePreferences } = usePreferenceContext();
  const { toast } = useToast();

  useEffect(() => {
    setURL(preferences.lmStudioBaseUrl);
  }, [preferences]);

  const handleURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setURL(e.target.value);
  };

  const verifyAndSaveURL = async () => {
    try {
      const response = await fetch(url + "/models");
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Lm Studio server endpoint is valid",
        });
        plausible.trackEvent("Api+Added", {
          props: {
            provider: "lmstudio",
          },
        });

        updatePreferences({ lmStudioBaseUrl: url });
        onRefresh();
      } else {
        throw new Error("Response status is not 200");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Invalid Lm Studio server endpoint",
        variant: "destructive",
      });
      onRefresh();
    }
  };

  const tabConfigs = [
    { value: "macos", label: "Macos", message: docs.lmStudioConfig },
    { value: "windows", label: "Windows", message: docs.lmStudioConfig },
  ];

  return (
    <Flex direction="col" gap="sm">
      <FormLabel label="Lm Studio local server URL" />
      <Input
        placeholder="http://localhost:1234"
        value={url}
        autoComplete="off"
        onChange={handleURLChange}
      />

      <Button variant="default" onClick={verifyAndSaveURL}>
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

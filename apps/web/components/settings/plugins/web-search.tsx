import { usePreferenceContext } from "@/lib/context";
import { configs } from "@repo/shared/config";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Flex, FormLabel, Input, Type, useToast } from "@repo/ui";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import { useEffect } from "react";
import ApiKeyInput from "../models/api-key-input";

export const WebSearchPlugin = () => {
    const { toast } = useToast();
  const { preferences, updatePreferences } = usePreferenceContext();

  useEffect(() => {}, []);

  const handleRunTest = async () => {
    try {
      const url = "https://www.googleapis.com/customsearch/v1";
      const params = {
        key: preferences.googleSearchApiKey,
        cx: preferences.googleSearchEngineId,
        q: "Latest news",
      };

      const response = await axios.get(url, { params });

      if (response.status === 200) {
        toast({
          title: "Test successful",
          description: "Google search plugin is working",
          variant: "default",
        });
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      toast({
        title: "Test failed",
        description: "Google search plugin is not working",
        variant: "destructive",
      });
    }
  };

  return (
    <Flex direction="col" gap="sm" className="border-t border-white/10 pt-2">
      <Flex className="mb-2 w-full" justify="between" items="center">
        <Type size="sm" textColor="secondary">
          Default Search Engine
        </Type>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary">
              {preferences.defaultWebSearchEngine}{" "}
              <ChevronDown size={12} strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]" align="end">
            <DropdownMenuItem
              onClick={() => {
                updatePreferences({ defaultWebSearchEngine: "google" });
              }}
            >
              Google
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                updatePreferences({ defaultWebSearchEngine: "duckduckgo" });
              }}
            >
              DuckDuckGo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Flex>
      {preferences.defaultWebSearchEngine === "google" && (
        <Flex
          direction="col"
          gap="lg"
          className="w-full border-t border-zinc-500/10 pt-4"
        >
          <Flex direction="col" gap="sm" className="w-full">
            <FormLabel
              label="Google Search Engine ID"
              linkText="Get your ID here"
              link={configs.googleSearchApiUrl}
            />

            <Input
              name="googleSearchEngineId"
              type="text"
              value={preferences.googleSearchEngineId ?? ""}
              autoComplete="off"
              onChange={(e) => {
                updatePreferences({ googleSearchEngineId: e.target.value });
              }}
            />
          </Flex>
          <Flex direction="col" gap="sm" className="w-full">
            <FormLabel
              label="Google Search Api Key"
              link={configs.googleSearchEngineApiKeyUrl}
              linkText="Get API key here"
            />

            <ApiKeyInput
              value={preferences.googleSearchApiKey ?? ""}
              setValue={(value) => {
                updatePreferences({ googleSearchApiKey: value });
              }}
              isDisabled={false}
              placeholder="Api Key"
              isLocked={false}
            />
          </Flex>
          <Button onClick={handleRunTest} size="sm">
            Check Connection
          </Button>
        </Flex>
      )}
    </Flex>
  );
};

import { usePreferenceContext } from "@/libs/context";
import { Button, Flex, Type } from "@/ui";
import Link from "next/link";

export const ApiKeyInfo = () => {
  const { apiKeys, preferences } = usePreferenceContext();

  const hasApiKeys =
    apiKeys.filter(
      (key) =>
        ["openai", "anthropic", "gemini", "groq"].includes(key.provider) &&
        key.key,
    ).length > 0;

  if (hasApiKeys) {
    return null;
  }
  if (preferences.defaultAssistant === "llmchat") {
    return (
      <Flex className="w-full py-1 pl-3 pr-1" justify="between" items="center">
        <Type size="xs" textColor="secondary">
          LLMChat is free to use with limited access, bring your own API key for
          unlimited access.
        </Type>
        <Button variant="link" size="xs" className="text-teal-600">
          Manage API Keys
        </Button>
      </Flex>
    );
  }
  return (
    <Flex className="w-full py-1 pl-3 pr-1" justify="between" items="center">
      <Type size="xs" textColor="secondary">
        Use your own API key or try{" "}
        <Link
          href="https://ollama.com"
          className="inline-block px-1 underline decoration-zinc-500/20 underline-offset-2"
        >
          Ollama
        </Link>{" "}
        for unlimited local access.
      </Type>
      <Button variant="link" size="xs" className="text-teal-600">
        Manage API Keys
      </Button>
    </Flex>
  );
};

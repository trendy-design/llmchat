import { useAssistantUtils } from "@/hooks";
import { usePreferenceContext } from "@/libs/context";
import { Button, Flex, Type } from "@/ui";
import Link from "next/link";

export const ApiKeyInfo = () => {
  const { apiKeys, preferences } = usePreferenceContext();
  const { getAssistantByKey } = useAssistantUtils();

  const assistant = getAssistantByKey(preferences.defaultAssistant);

  const hasApiKeys =
    apiKeys.filter(
      (key) => assistant?.model.provider === key.provider && key.key,
    ).length > 0;

  if (preferences.defaultAssistant === "llmchat") {
    return (
      <Flex className="w-full py-1 pl-3 pr-1" justify="between" items="center">
        <Type size="xs" textColor="secondary">
          LLMChat: Free with limits in public beta. Add API keys for unlimited
          use.
        </Type>
        <Button
          variant="link"
          size="xs"
          className="text-teal-600"
          onClick={() => {
            window.location.href = window.location.origin + "/settings/llms/";
          }}
        >
          Add API Keys
        </Button>
      </Flex>
    );
  }

  if (hasApiKeys) {
    return null;
  }
  return (
    <Flex className="w-full py-1 pl-3 pr-1" justify="between" items="center">
      <Type size="xs" textColor="secondary">
        Use your own {assistant?.model.provider} API key or try{" "}
        <Link
          href={window.location.origin + "/settings/llms/ollama"}
          className="inline-block px-1 underline decoration-zinc-500/20 underline-offset-2"
        >
          Ollama
        </Link>{" "}
        for unlimited local access.
      </Type>
      <Button
        variant="link"
        size="xs"
        className="text-teal-600"
        onClick={() => {
          window.location.href =
            window.location.origin +
            "/settings/llms/" +
            assistant?.model.provider;
        }}
      >
        Add API Key
      </Button>
    </Flex>
  );
};

import { useAssistantUtils } from "@/hooks";
import { useAuth, usePreferenceContext } from "@/libs/context";
import { useRootContext } from "@/libs/context/root";
import { Button, Flex, Type } from "@/ui";
import { Plug } from "lucide-react";

export const ApiKeyStatus = () => {
  const { setOpenApiKeyModal, setApiKeyModalProvider } = useRootContext();
  const { apiKeys, preferences } = usePreferenceContext();
  const { getAssistantByKey } = useAssistantUtils();
  const { open: openSignIn } = useAuth();
  const assistant = getAssistantByKey(preferences.defaultAssistant);

  const hasApiKeys =
    apiKeys.filter(
      (key) => assistant?.model.provider === key.provider && key.key,
    ).length > 0;

  if (preferences.defaultAssistant === "llmchat") {
    return (
      <Flex className="w-full" justify="between" items="center">
        <Type
          size="xs"
          textColor="secondary"
          className="rounded-full bg-zinc-50 px-3 py-1.5 text-center"
        >
          LLMChat is free to use with daily limits.{" "}
          <span
            className="inline-block cursor-pointer px-1 underline decoration-zinc-500/20 underline-offset-2"
            onClick={openSignIn}
          >
            Sign in
          </span>{" "}
          required.
        </Type>
      </Flex>
    );
  }

  if (hasApiKeys) {
    return null;
  }
  return (
    <Flex className="p-2" justify="between" items="center">
      {assistant?.model.provider && (
        <Button
          rounded="full"
          size="xs"
          className="px-3"
          onClick={() => {
            setOpenApiKeyModal(true);
            setApiKeyModalProvider(assistant?.model.provider);
          }}
        >
          <Plug size={14} /> Set API Key
        </Button>
      )}
    </Flex>
  );
};

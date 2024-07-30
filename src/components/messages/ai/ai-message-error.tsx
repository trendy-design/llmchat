import { Button, Flex, Type } from "@/components/ui";
import { Alert02Icon } from "@/components/ui/icons";
import { useAuth } from "@/context/auth";
import { useAssistantUtils } from "@/hooks";
import { useLLMRunner } from "@/hooks/use-llm-runner";
import { TChatMessage } from "@/types";
import { useRouter } from "next/navigation";
import { FC } from "react";

type TAIMessageError = {
  stopReason?: string;
  errorMessage?: string;
  message: TChatMessage;
};

type ErrorConfig = {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export const AIMessageError: FC<TAIMessageError> = ({
  stopReason,
  message,
}) => {
  const { push } = useRouter();
  const { open: openSignIn } = useAuth();
  const { getModelByKey } = useAssistantUtils();
  const { invokeModel } = useLLMRunner();

  if (!stopReason || ["finish", "cancel", undefined].includes(stopReason)) {
    return null;
  }

  const model = getModelByKey(
    message?.runConfig?.assistant.baseModel,
    message?.runConfig?.assistant.provider,
  );

  const errorConfigs: Record<string, ErrorConfig> = {
    apikey: {
      message: "API Key is invalid or expired.",
      action: {
        label: "Check API Key",
        onClick: () => push(`/settings/llms/${model?.provider}`),
      },
    },
    rateLimit: {
      message:
        "Too many requests. Please try again later or use your own API key.",
      action: {
        label: "Open Settings",
        onClick: () => push("/settings/llms"),
      },
    },
    unauthorized: {
      message: "You are not authorized to access this resource.",
      action: {
        label: "Sign In",
        onClick: openSignIn,
      },
    },
    default: {
      message:
        "An unexpected error occurred. Please try again or contact support.",
      action: {
        label: "Retry",
        onClick: () => {
          invokeModel(message.runConfig);
        },
      },
    },
  };

  const { message: errorMessage, action } =
    errorConfigs[stopReason] || errorConfigs.default;

  return (
    <Flex
      className="mb-4 rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:bg-white/5"
      gap="sm"
      items="center"
    >
      <Alert02Icon size={16} variant="solid" />
      <Type textColor="secondary">{errorMessage}</Type>
      {action && (
        <Button variant="ghost" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Flex>
  );
};

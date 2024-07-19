import { Flex, Type } from "@/components/ui";
import { useSettingsContext } from "@/context";
import { Alert02Icon } from "@hugeicons/react";
import { FC } from "react";

type TAIMessageError = {
  stopReason?: string;
  errorMessage?: string;
};

export const AIMessageError: FC<TAIMessageError> = ({
  stopReason,
  errorMessage,
}) => {
  const { open: openSettings } = useSettingsContext();

  if (["finish", "cancel", undefined].includes(stopReason)) {
    return <></>;
  }

  const renderErrorMessage = (stopReason?: string) => {
    if (stopReason === "apikey") {
      return (
        <Type textColor="secondary">
          API Key is invalid or expired.
          <span
            className="cursor-pointer underline ml-1"
            onClick={() => openSettings()}
          >
            Check your API Key
          </span>
        </Type>
      );
    }
    return <Type textColor="secondary">An unexpected error occurred.</Type>;
  };

  return (
    <Flex className="text-sm text-zinc-500 p-1" gap="sm" items="center">
      <Alert02Icon size={16} strokeWidth={1.5} />
      {renderErrorMessage(stopReason)}
    </Flex>
  );
};

import { useAssistantUtils } from "@/lib/hooks";
import { TAssistant, TModelKey } from "@/lib/types";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
} from "@/ui";
import { ChevronDown, RefreshCcw } from "lucide-react";
import { useState } from "react";

export type TRegenerateModelSelect = {
  assistant: TAssistant;
  onRegenerate: (modelKey: TModelKey) => void;
};

export const RegenerateWithModelSelect = ({
  assistant,
  onRegenerate,
}: TRegenerateModelSelect) => {
  const { assistants, getAssistantByKey, getAssistantIcon } =
    useAssistantUtils();
  const [isOpen, setIsOpen] = useState(false);

  const messageAssistantProps = getAssistantByKey(assistant.key);

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip content="Regenerate">
          <DropdownMenuTrigger asChild>
            {
              <Button variant="secondary" size="sm" rounded="lg">
                <RefreshCcw size={14} strokeWidth="2" />
                Regenerate
                <ChevronDown size={14} strokeWidth="2" />
              </Button>
            }
          </DropdownMenuTrigger>
        </Tooltip>

        <DropdownMenuContent className="no-scrollbar h-[250px] min-w-[250px] overflow-y-auto">
          {assistants.map((assistant) => {
            const assistantProps = getAssistantByKey(assistant.key);

            return (
              <DropdownMenuItem
                key={assistant.key}
                onClick={() => {
                  onRegenerate(assistant.key);
                }}
              >
                {getAssistantIcon(assistant.key, "sm")}
                {assistantProps?.assistant.name}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

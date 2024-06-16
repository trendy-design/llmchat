import { TModelKey, useModelList } from "@/hooks/use-model-list";
import { ArrowClockwise } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip } from "./ui/tooltip";

export type TRegenerateModelSelect = {
  onRegenerate: (modelKey: TModelKey) => void;
};

export const RegenerateWithModelSelect = ({
  onRegenerate,
}: TRegenerateModelSelect) => {
  const { assistants, getAssistantByKey } = useModelList();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip content="Regenerate">
          <DropdownMenuTrigger asChild>
            {
              <Button variant="ghost" size="iconSm" rounded="lg">
                <ArrowClockwise size={16} weight="bold" />
              </Button>
            }
          </DropdownMenuTrigger>
        </Tooltip>

        <DropdownMenuContent className="min-w-[250px] h-[300px] no-scrollbar overflow-y-auto">
          {assistants.map((assistant) => {
            const assistantProps = getAssistantByKey(assistant.key);

            return (
              <DropdownMenuItem
                key={assistant.key}
                onClick={() => {
                  onRegenerate(assistant.key);
                }}
              >
                {assistantProps?.model.icon("sm")}{" "}
                {assistantProps?.assistant.name}{" "}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

import { useAssistantUtils } from "@/lib/hooks";
import { TModelKey } from "@repo/shared/types";
import {
  Badge, Button, ButtonProps, DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger, cn
} from "@repo/ui";
import { FC, useState } from "react";

export type TModelSelect = {
  selectedModel: TModelKey;
  fullWidth?: boolean;
  variant?: ButtonProps["variant"];
  setSelectedModel: (model: TModelKey) => void;
  className?: string;
};

export const ModelSelect: FC<TModelSelect> = ({
  selectedModel,
  variant,
  fullWidth,
  setSelectedModel,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    getModelByKey,
    models,
    assistants,
    getAssistantByKey,
    getAssistantIcon,
  } = useAssistantUtils();

  const activeAssistant = getAssistantByKey(selectedModel);

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className={cn("gap-2 text-xs md:text-sm", className)}
            size="sm"
          >
            {activeAssistant?.assistant &&
              getAssistantIcon(activeAssistant?.assistant.key, "sm")}
            {activeAssistant?.assistant.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          sideOffset={4}
          className={cn(
            "no-scrollbar z-[610] max-h-[260px] overflow-y-auto text-xs md:text-sm",
            fullWidth ? "w-full" : "min-w-[250px]",
          )}
        >
          {assistants
            ?.filter((a) => a.type === "base")
            .map((assistant) => {
              const model = getModelByKey(
                assistant.baseModel,
                assistant.provider,
              );

              return (
                <DropdownMenuItem
                  className={cn(
                    "text-xs font-medium md:text-sm",
                    activeAssistant?.assistant.key === assistant.key &&
                      "bg-zinc-50 dark:bg-black/30",
                  )}
                  key={assistant.key}
                  onClick={() => {
                    setSelectedModel(assistant.key);
                    setIsOpen(false);
                  }}
                >
                  {getAssistantIcon(assistant.key, "sm")}
                  {assistant.name}
                  {model?.isNew && <Badge>New</Badge>}
                </DropdownMenuItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

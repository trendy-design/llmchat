import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/helper/clsx";
import { useAssistantUtils } from "@/hooks/use-assistant-utils";
import { TModelKey } from "@/types";
import { FC, useState } from "react";
import { ModelIcon } from "./model-icon";

export type TModelSelect = {
  selectedModel: TModelKey;
  fullWidth?: boolean;
  variant?: "outline" | "ghost" | "default" | "secondary";
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
            variant={variant || "ghost"}
            className={cn("pl-1 pr-3 gap-2 text-xs md:text-sm", className)}
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
            "text-xs z-[610] md:text-sm max-h-[260px] overflow-y-auto no-scrollbar",
            fullWidth ? "w-full" : "min-w-[250px]"
          )}
        >
          {assistants
            ?.filter((a) => a.type === "base")
            .map((assistant) => {
              const model = getModelByKey(assistant.baseModel);

              return (
                <DropdownMenuItem
                  className={cn(
                    "text-xs md:text-sm font-medium",
                    activeAssistant?.assistant.key === assistant.key &&
                      "dark:bg-black/30 bg-zinc-50"
                  )}
                  key={assistant.key}
                  onClick={() => {
                    setSelectedModel(assistant.key);
                    setIsOpen(false);
                  }}
                >
                  {assistant.type === "base" ? (
                    getAssistantIcon(assistant.key, "sm")
                  ) : (
                    <ModelIcon type="custom" size="sm" />
                  )}
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

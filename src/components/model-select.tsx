import { TModelKey, useModelList } from "@/hooks/use-model-list";
import { defaultPreferences, usePreferences } from "@/hooks/use-preferences";
import { cn } from "@/lib/utils";
import { GearSix } from "@phosphor-icons/react";
import { DropdownMenuSubTrigger } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { ModelInfo } from "./model-info";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export type TModelSelect = {
  selectedModel: TModelKey;
  fullWidth?: boolean;
  variant?: "outline" | "ghost" | "default" | "secondary";
  setSelectedModel: (model: TModelKey) => void;
  className?: string;
};

export const ModelSelect = ({
  selectedModel,
  variant,
  fullWidth,
  setSelectedModel,
  className,
}: TModelSelect) => {
  const [isOpen, setIsOpen] = useState(false);
  const { preferencesQuery, setPreferencesMutation } = usePreferences();
  const { getModelByKey, models } = useModelList();

  const activeModel =
    preferencesQuery?.data?.defaultModel && getModelByKey(selectedModel);

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant || "ghost"}
            className={cn("pl-1 pr-3 gap-2 text-xs md:text-sm", className)}
            size="sm"
          >
            {activeModel?.icon()} {activeModel?.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          sideOffset={4}
          className={cn(
            "text-xs md:text-sm max-h-[260px] overflow-y-auto no-scrollbar",
            fullWidth ? "w-full" : "min-w-[250px]"
          )}
        >
          {models.map((model) => (
            <DropdownMenuSub key={model.key}>
              <DropdownMenuSubTrigger asChild>
                <DropdownMenuItem
                  className={cn(
                    "text-xs md:text-sm font-medium",
                    activeModel?.key === model.key &&
                      "dark:bg-black/30 bg-zinc-50"
                  )}
                  key={model.key}
                  onClick={() => {
                    setPreferencesMutation.mutate(
                      {
                        defaultModel: model.key,
                        maxTokens: defaultPreferences.maxTokens,
                      },
                      {
                        onSuccess: () => {
                          setSelectedModel(model.key);
                          setIsOpen(false);
                        },
                      }
                    );
                  }}
                >
                  {model.icon()} {model.name}{" "}
                  {model.isNew && <Badge>New</Badge>}
                </DropdownMenuItem>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="dark bg-zinc-800 p-4 flex flex-col gap-3 tracking-[0.1px] text-sm md:text-base rounded-2xl min-w-[280px]">
                  <ModelInfo model={model} />
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem key={"manage"} onClick={() => {}}>
            <div className="w-6 flex flex-row justify-center">
              <GearSix size={16} weight="bold" />
            </div>
            Manage Models
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

import { TModelKey, useModelList } from "@/hooks/use-model-list";
import { defaultPreferences, usePreferences } from "@/hooks/use-preferences";
import { cn } from "@/lib/utils";
import { GearSix } from "@phosphor-icons/react";
import { DropdownMenuSubTrigger } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
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

export const ModelSelect = () => {
  const [selectedModel, setSelectedModel] = useState<TModelKey>("gpt-4-turbo");
  const [isOpen, setIsOpen] = useState(false);
  const { getPreferences, setPreferences } = usePreferences();
  const { getModelByKey, models } = useModelList();

  useEffect(() => {
    getPreferences().then((preferences) => {
      setSelectedModel(preferences.defaultModel);
    });
  }, []);

  const activeModel = getModelByKey(selectedModel);

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="pl-1 pr-3 gap-2 text-xs" size="sm">
            {activeModel?.icon()} {activeModel?.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          sideOffset={4}
          className="min-w-[250px] text-sm max-h-[260px] overflow-y-auto no-scrollbar"
        >
          {models.map((model) => (
            <DropdownMenuSub key={model.key}>
              <DropdownMenuSubTrigger asChild>
                <DropdownMenuItem
                  className={cn(
                    "text-sm font-medium",
                    activeModel?.key === model.key &&
                      "dark:bg-black/30 bg-zinc-50"
                  )}
                  key={model.key}
                  onClick={() => {
                    setPreferences({
                      defaultModel: model.key,
                      maxTokens: defaultPreferences.maxTokens,
                    }).then(() => {
                      setSelectedModel(model.key);
                      setIsOpen(false);
                    });
                  }}
                >
                  {model.icon()} {model.name}{" "}
                  {model.isNew && <Badge>New</Badge>}
                </DropdownMenuItem>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="dark bg-zinc-800 p-4 flex flex-col gap-3 tracking-[0.1px] text-sm rounded-2xl min-w-[280px]">
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

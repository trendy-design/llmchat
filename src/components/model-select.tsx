import { TModelKey, useModelList } from "@/hooks/use-model-list";
import { usePreferences } from "@/hooks/use-preferences";
import { formatNumber } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { GearSix } from "@phosphor-icons/react";
import { DropdownMenuSubTrigger } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
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
        <DropdownMenuContent className="min-w-[250px] text-sm max-h-[260px] overflow-y-auto no-scrollbar">
          {models.map((model) => (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger asChild>
                <DropdownMenuItem
                  className={cn(
                    activeModel?.key === model.key &&
                      "dark:bg-zinc-800 bg-zinc-200"
                  )}
                  key={model.key}
                  onClick={() => {
                    setPreferences({ defaultModel: model.key }).then(() => {
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
                <DropdownMenuSubContent className="dark bg-zinc-900 p-4 flex flex-col gap-3 tracking-[0.1px] text-sm rounded-xl min-w-[280px]">
                  <div className="flex flex-row gap-2">
                    {model.icon()} {model.name}
                  </div>
                  <div className="flex flex-row justify-between text-xs text-zinc-500">
                    <p className="">Tokens</p>
                    <p>{formatNumber(model.tokens)} tokens</p>
                  </div>
                  <div className="flex flex-row justify-between text-xs text-zinc-500">
                    <p className="">Model</p>
                    <p>{model.key}</p>
                  </div>
                  {model.inputPrice && (
                    <div className="flex flex-row justify-between text-xs text-zinc-500">
                      <p className="">Input Price</p>
                      <p>{model.inputPrice} USD / 1M tokens</p>
                    </div>
                  )}
                  {model.outputPrice && (
                    <div className="flex flex-row justify-between text-xs text-zinc-500">
                      <p className="">Output Price</p>
                      <p>{model.outputPrice} USD / 1M tokens</p>
                    </div>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem key={"manage"} onClick={() => {}}>
            <div className="w-6 flex flex-row justify-center">
              <GearSix size={16} weight="fill" />
            </div>
            Manage Models
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

import { TModelKey, useModelList } from "@/hooks/use-model-list";
import { usePreferences } from "@/hooks/use-preferences";
import { TToolKey, useTools } from "@/hooks/use-tools";
import { PuzzlePiece } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Switch } from "./ui/switch";
import { Tooltip } from "./ui/tooltip";
export type TPluginSelect = {
  selectedModel: TModelKey;
};

export const PluginSelect = ({ selectedModel }: TPluginSelect) => {
  const [isOpen, setIsOpen] = useState(false);
  const { tools } = useTools();
  const { getModelByKey } = useModelList();
  const { setPreferences, getPreferences } = usePreferences();
  const [selectedPlugins, setSelectedPlugins] = useState<TToolKey[]>([]);
  useEffect(() => {
    getPreferences().then((preferences) => {
      setSelectedPlugins(preferences.defaultPlugins || []);
    });
  }, [isOpen]);

  const model = getModelByKey(selectedModel);

  if (!model?.plugins?.length) {
    return null;
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip content="Plugins">
          <PopoverTrigger asChild>
            <Button variant="ghost" size="iconSm">
              <PuzzlePiece size={16} weight="bold" />
            </Button>
          </PopoverTrigger>
        </Tooltip>
        <PopoverContent
          className="p-1 w-[250px] dark:bg-zinc-700 mr-8 roundex-2xl"
          side="top"
        >
          {tools.map((tool) => (
            <div
              key={tool.key}
              className="flex text-xs md:text-sm gap-2 flex-row w-full p-2 hover:bg-zinc-50 dark:hover:bg-black/30 rounded-2xl"
            >
              {tool.icon("md")} {tool.name} <span className="flex-1" />
              <Switch
                checked={selectedPlugins.includes(tool.key)}
                onCheckedChange={(checked) => {
                  getPreferences().then((preferences) => {
                    const defaultPlugins = preferences.defaultPlugins || [];
                    if (checked) {
                      setPreferences({
                        defaultPlugins: [...defaultPlugins, tool.key],
                      });
                      setSelectedPlugins([...selectedPlugins, tool.key]);
                    } else {
                      setPreferences({
                        defaultPlugins: defaultPlugins.filter(
                          (plugin) => plugin !== tool.key
                        ),
                      });
                      setSelectedPlugins(
                        selectedPlugins.filter((plugin) => plugin !== tool.key)
                      );
                    }
                  });
                }}
              />
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </>
  );
};

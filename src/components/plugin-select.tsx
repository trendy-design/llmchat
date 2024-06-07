import { usePreferenceContext } from "@/context/preferences/provider";
import { TModelKey, useModelList } from "@/hooks/use-model-list";
import { TToolKey, useTools } from "@/hooks/use-tools";
import { Plug } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
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
  const { preferences, updatePreferences } = usePreferenceContext();
  const availableTools = tools.filter((tool) => tool.showInMenu);
  const availableToolsKey = availableTools.map((tool) => tool.key);
  const [selectedPlugins, setSelectedPlugins] = useState<TToolKey[]>([]);
  useEffect(() => {
    setSelectedPlugins(
      preferences.defaultPlugins?.filter((p) =>
        availableToolsKey.includes(p)
      ) || []
    );
  }, [isOpen, preferences]);

  const model = getModelByKey(selectedModel);

  if (!model?.plugins?.length) {
    return null;
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip content="Plugins">
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plug size={16} weight="bold" />
              <Badge>{selectedPlugins.length}</Badge>
            </Button>
          </PopoverTrigger>
        </Tooltip>
        <PopoverContent
          className="p-0 w-[300px] dark:bg-zinc-700 mr-8 roundex-2xl"
          side="top"
        >
          <p className="flex flex-row gap-2 py-2 px-3 text-sm font-medium border-b border-zinc-500/20">
            Plugins <Badge>Beta</Badge>
          </p>
          <div className="flex flex-col p-1">
            {availableTools.map((tool) => (
              <div
                key={tool.key}
                className="flex text-xs md:text-sm gap-2 flex-row items-center w-full p-2 hover:bg-zinc-50 dark:hover:bg-black/30 rounded-2xl"
              >
                {tool.icon("md")} {tool.name} <span className="flex-1" />
                <Switch
                  checked={selectedPlugins.includes(tool.key)}
                  onCheckedChange={async (checked) => {
                    const defaultPlugins = preferences.defaultPlugins || [];
                    const isValidated = await tool?.validate?.();

                    if (checked) {
                      if (tool?.validate === undefined || isValidated) {
                        updatePreferences({
                          defaultPlugins: [...defaultPlugins, tool.key],
                        });
                        setSelectedPlugins([...selectedPlugins, tool.key]);
                      } else {
                        tool?.validationFailedAction?.();
                      }
                    } else {
                      updatePreferences({
                        defaultPlugins: defaultPlugins.filter(
                          (plugin) => plugin !== tool.key
                        ),
                      });
                      setSelectedPlugins(
                        selectedPlugins.filter((plugin) => plugin !== tool.key)
                      );
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

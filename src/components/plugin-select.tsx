import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Type } from "@/components/ui/text";
import { Tooltip } from "@/components/ui/tooltip";
import { usePreferenceContext } from "@/context/preferences";
import { useModelList } from "@/hooks/use-model-list";
import { useTools } from "@/hooks/use-tools";
import { TToolKey } from "@/types";
import { ConnectIcon } from "@hugeicons/react";
import { FC, useEffect, useState } from "react";

export type TPluginSelect = {
  selectedAssistantKey: string;
};

export const PluginSelect: FC<TPluginSelect> = ({ selectedAssistantKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { tools } = useTools();
  const { getAssistantByKey } = useModelList();
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

  const assistantProps = getAssistantByKey(selectedAssistantKey);

  if (!assistantProps?.model?.plugins?.length) {
    return null;
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip content="Plugins">
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <ConnectIcon size={16} variant="stroke" strokeWidth="2" />
              <Badge>{selectedPlugins.length}</Badge>
            </Button>
          </PopoverTrigger>
        </Tooltip>
        <PopoverContent
          className="p-0 w-[340px] dark:bg-zinc-700 mr-8 roundex-2xl"
          side="top"
        >
          <p className="flex flex-row gap-2 py-2 px-3 text-sm font-medium border-b border-zinc-500/20">
            Plugins <Badge>Beta</Badge>
          </p>
          <div className="flex flex-col p-1">
            {availableTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.key}
                  className="flex text-xs md:text-sm gap-3 flex-row items-center w-full py-2 px-3 hover:bg-zinc-50 dark:hover:bg-black/30 rounded-2xl"
                >
                  <Icon size={20} strokeWidth={1.5} />
                  <Flex direction="col" gap="none" items="start">
                    <Type size="sm" weight="medium">
                      {tool.name}
                    </Type>
                    <Type size="xs" textColor="tertiary">
                      {tool.description}
                    </Type>
                  </Flex>
                  <span className="flex-1" />
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
                          selectedPlugins.filter(
                            (plugin) => plugin !== tool.key
                          )
                        );
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

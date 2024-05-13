import { TModelKey, useModelList } from "@/hooks/use-model-list";
import { usePreferences } from "@/hooks/use-preferences";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const ModelSelect = () => {
  const [selectedModel, setSelectedModel] = useState<TModelKey>("gpt-4-turbo");

  const { getPreferences, setPreferences } = usePreferences();
  const { getModelByKey, models } = useModelList();

  useEffect(() => {
    getPreferences().then((preferences) => {
      setSelectedModel(preferences.defaultModel);
    });
  }, []);

  const activeModel = getModelByKey(selectedModel);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="pl-2 pr-4">
          {activeModel?.icon()} {activeModel?.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-2 mt-2">
        {models.map((model) => (
          <DropdownMenuItem
            onClick={() => {
              setPreferences({ defaultModel: model.key }).then(() => {
                setSelectedModel(model.key);
              });
            }}
          >
            {model.icon()} {model.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

import { TModelKey, useModelList } from "@/hooks/use-model-list";
import { usePreferences } from "@/hooks/use-preferences";
import { cn } from "@/lib/utils";
import { CheckCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>
        <Button
          variant="secondary"
          className="pl-1 pr-3 gap-1 text-xs"
          size="sm"
        >
          {activeModel?.icon()} {activeModel?.name}
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-0  overflow-hidden">
        <div className="p-2 max-h-[320px] overflow-y-auto no-scrollbar">
          {models.map((model) => (
            <div
              className={cn(
                "flex flex-row items-center gap-2 justify-between text-sm p-3 hover:bg-white/5 cursor-pointer rounded-2xl",
                activeModel?.key === model.key && "bg-white/5"
              )}
              key={model.key}
              onClick={() => {
                setPreferences({ defaultModel: model.key }).then(() => {
                  setSelectedModel(model.key);
                  setIsOpen(false);
                });
              }}
            >
              <div className="flex flex-row gap-3 items-center">
                {model.icon()} {model.name} {model.isNew && <Badge>New</Badge>}
              </div>
              <div className="flex flex-row gap-3 items-center">
                {activeModel?.key === model.key && (
                  <CheckCircle size={24} weight="fill" />
                )}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

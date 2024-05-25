import { useModelSettings } from "@/hooks/use-model-settings";
import { TPreferences, defaultPreferences } from "@/hooks/use-preferences";
import { Info, SlidersHorizontal } from "@phosphor-icons/react";
import { useState } from "react";
import { ModelInfo } from "./model-info";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Slider } from "./ui/slider";
import { Tooltip } from "./ui/tooltip";

export const QuickSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { formik, setPreferences, selectedModel } = useModelSettings({
    refresh: isOpen,
  });
  const renderResetToDefault = (key: keyof TPreferences) => {
    return (
      <Button
        variant="link"
        size="linkSm"
        onClick={() => {
          setPreferences({ [key]: defaultPreferences[key] });
          formik.setFieldValue(key, defaultPreferences[key]);
        }}
      >
        Reset
      </Button>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip content="Configure Model">
        <PopoverTrigger asChild>
          <Button variant="ghost" size="iconSm">
            <SlidersHorizontal size={20} weight="bold" />
          </Button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent className="p-0 dark:bg-zinc-700 mr-8 roundex-2xl">
        {selectedModel && (
          <div className="border-b dark:border-white/10 border-black/10 p-3">
            <ModelInfo model={selectedModel} showDetails={false} />
          </div>
        )}
        <div className="grid grid-cols-1 p-1">
          <div className="flex flex-col w-full p-3 hover:bg-zinc-50 dark:hover:bg-black/30 rounded-2xl">
            <div className="flex flex-row items-center justify-between w-full">
              <Tooltip content="Temprature">
                <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 flex flex-row items-center gap-1">
                  MaxTokens <Info weight="regular" size={14} />{" "}
                  {formik.values.maxTokens}
                </p>
              </Tooltip>
              {renderResetToDefault("maxTokens")}
            </div>
            <Slider
              className="my-2"
              value={[Number(formik.values.maxTokens)]}
              step={1}
              min={0}
              max={selectedModel?.maxOutputTokens}
              onValueChange={(value: number[]) => {
                setPreferences({ maxTokens: value?.[0] });
                formik.setFieldValue("maxTokens", value?.[0]);
              }}
            />
            <div className="flex flex-row justify-between w-full">
              <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-600">
                Precise
              </p>
              <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-600">
                Neutral
              </p>
              <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-600">
                Creative
              </p>
            </div>
          </div>
          <div className="flex flex-col w-full p-3 hover:bg-zinc-50 dark:hover:bg-black/30 rounded-2xl">
            <div className="flex flex-row items-center justify-between w-full">
              <Tooltip content="Temprature">
                <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 flex flex-row items-center gap-1">
                  Temperature <Info weight="regular" size={14} />{" "}
                  {formik.values.temperature}
                </p>
              </Tooltip>
              {renderResetToDefault("temperature")}
            </div>
            <Slider
              className="my-2"
              value={[Number(formik.values.temperature)]}
              step={0.1}
              min={0.1}
              max={1}
              onValueChange={(value: number[]) => {
                setPreferences({ temperature: value?.[0] });
                formik.setFieldValue("temperature", value?.[0]);
              }}
            />
            <div className="flex flex-row justify-between w-full">
              <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-600">
                Precise
              </p>
              <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-600">
                Neutral
              </p>
              <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-600">
                Creative
              </p>
            </div>
          </div>{" "}
          <div className="flex flex-col w-full p-3 hover:bg-zinc-50 dark:hover:bg-black/30 rounded-2xl">
            <div className="flex flex-row items-center justify-between w-full">
              <Tooltip content="TopP">
                <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 flex flex-row items-center gap-1">
                  TopP <Info weight="regular" size={14} /> {formik.values.topP}
                </p>
              </Tooltip>
              {renderResetToDefault("topP")}
            </div>
            <Slider
              className="my-2"
              value={[Number(formik.values.topP)]}
              step={0.1}
              min={0.1}
              max={1}
              onValueChange={(value: number[]) => {
                setPreferences({ topP: value?.[0] });
                formik.setFieldValue("topP", value?.[0]);
              }}
            />
            <div className="flex flex-row justify-between w-full">
              <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-600">
                Precise
              </p>

              <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-600">
                Creative
              </p>
            </div>
          </div>{" "}
          <div className="flex flex-col w-full p-3 hover:bg-zinc-50 dark:hover:bg-black/30 rounded-2xl">
            <div className="flex flex-row items-center justify-between w-full">
              <Tooltip content="TopK">
                <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 flex flex-row items-center gap-1">
                  TopK <Info weight="regular" size={14} /> {formik.values.topK}
                </p>
              </Tooltip>
              {renderResetToDefault("topK")}
            </div>
            <Slider
              className="my-2"
              value={[Number(formik.values.topK)]}
              step={0.1}
              min={0.1}
              max={1}
              onValueChange={(value: number[]) => {
                setPreferences({ topK: value?.[0] });
                formik.setFieldValue("topK", value?.[0]);
              }}
            />
            <div className="flex flex-row justify-between w-full">
              <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-600">
                Precise
              </p>

              <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-600">
                Creative
              </p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

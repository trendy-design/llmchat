import { usePreferenceContext } from "@/context/preferences/context";
import { useModelList } from "@/hooks/use-model-list";
import { useModelSettings } from "@/hooks/use-model-settings";
import { TPreferences, defaultPreferences } from "@/hooks/use-preferences";
import { ArrowClockwise, Info, SlidersHorizontal } from "@phosphor-icons/react";
import { useState } from "react";
import { ModelInfo } from "./model-info";
import { Button } from "./ui/button";
import { Flex } from "./ui/flex";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Slider } from "./ui/slider";
import { Type } from "./ui/text";
import { Tooltip } from "./ui/tooltip";

export const QuickSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { preferencesQuery } = usePreferenceContext();
  const { getModelByKey } = useModelList();
  const { formik, setPreferences } = useModelSettings({
    refresh: isOpen,
  });
  const renderResetToDefault = (key: keyof TPreferences) => {
    return (
      <Button
        variant="outline"
        size="iconXS"
        rounded="lg"
        onClick={() => {
          setPreferences({ [key]: defaultPreferences[key] });
          formik.setFieldValue(key, defaultPreferences[key]);
        }}
      >
        <ArrowClockwise size={14} weight="bold" />
      </Button>
    );
  };

  const model =
    preferencesQuery.data?.defaultModel &&
    getModelByKey(preferencesQuery.data?.defaultModel);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip content="Configure Model">
        <PopoverTrigger asChild>
          <Button variant="ghost" size="iconSm">
            <SlidersHorizontal size={16} weight="bold" />
          </Button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent className="p-0 dark:bg-zinc-700 mr-8 roundex-2xl w-[300px]">
        {model && (
          <div className="border-b dark:border-white/10 border-black/10 p-2">
            <ModelInfo model={model} showDetails={false} />
          </div>
        )}
        <Flex direction="col" className="w-full px-3 py-1">
          <Flex items="center" justify="between" className="w-full">
            <Tooltip content="Temprature">
              <Type
                className="flex flex-row items-center gap-1"
                textColor="secondary"
              >
                MaxTokens <Info weight="regular" size={14} />{" "}
                {formik.values.maxTokens}
              </Type>
            </Tooltip>
            <Flex items="center" gap="md">
              <Slider
                className="my-2 w-[80px]"
                value={[Number(formik.values.maxTokens)]}
                step={1}
                min={0}
                max={model?.maxOutputTokens}
                onValueChange={(value: number[]) => {
                  setPreferences({ maxTokens: value?.[0] });
                  formik.setFieldValue("maxTokens", value?.[0]);
                }}
              />
              {renderResetToDefault("maxTokens")}
            </Flex>
          </Flex>
          <Flex items="center" justify="between" className="w-full">
            <Tooltip content="Temprature">
              <Type
                className="flex flex-row items-center gap-1"
                textColor="secondary"
              >
                Temperature <Info weight="regular" size={14} />
                {formik.values.temperature}
              </Type>
            </Tooltip>
            <Flex items="center" gap="md">
              <Slider
                className="my-2 w-[80px]"
                value={[Number(formik.values.temperature)]}
                step={0.1}
                min={0.1}
                max={1}
                onValueChange={(value: number[]) => {
                  setPreferences({ temperature: value?.[0] });
                  formik.setFieldValue("temperature", value?.[0]);
                }}
              />
              {renderResetToDefault("temperature")}
            </Flex>
          </Flex>
          <Flex items="center" justify="between" className="w-full">
            <Tooltip content="TopP">
              <Type
                className="flex flex-row items-center gap-1"
                textColor="secondary"
              >
                TopP <Info weight="regular" size={14} /> {formik.values.topP}
              </Type>
            </Tooltip>
            <Flex items="center" gap="md">
              <Slider
                className="my-2 w-[80px]"
                value={[Number(formik.values.topP)]}
                step={0.1}
                min={0.1}
                max={1}
                onValueChange={(value: number[]) => {
                  setPreferences({ topP: value?.[0] });
                  formik.setFieldValue("topP", value?.[0]);
                }}
              />
              {renderResetToDefault("topP")}
            </Flex>
          </Flex>
          <Flex items="center" justify="between" className="w-full">
            <Tooltip content="TopK">
              <Type
                className="flex flex-row items-center gap-1"
                textColor="secondary"
              >
                TopK <Info weight="regular" size={14} /> {formik.values.topK}
              </Type>
            </Tooltip>
            <Flex items="center" gap="md">
              <Slider
                className="my-2 w-[80px]"
                value={[Number(formik.values.topK)]}
                step={0.1}
                min={0.1}
                max={1}
                onValueChange={(value: number[]) => {
                  setPreferences({ topK: value?.[0] });
                  formik.setFieldValue("topK", value?.[0]);
                }}
              />
              {renderResetToDefault("topK")}
            </Flex>
          </Flex>
        </Flex>
      </PopoverContent>
    </Popover>
  );
};

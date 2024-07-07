import { ModelIcon, ModelIconType } from "@/components/model-icon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Flex } from "@/components/ui/flex";
import { usePreferenceContext } from "@/context";
import { WebSearchPlugin } from "./web-search";

export const PulginSettings = () => {
  const { apiKeys } = usePreferenceContext();
  const pluginSettingsData = [
    {
      value: "websearch",
      label: "Web Search",
      iconType: "websearch",
      settingsComponent: WebSearchPlugin,
    },
  ];
  return (
    <Flex direction="col" gap="lg" className="p-2">
      <Accordion type="single" collapsible className="w-full">
        {pluginSettingsData.map((plugin) => (
          <AccordionItem key={plugin.value} value={plugin.value}>
            <AccordionTrigger>
              <Flex gap="sm" items="center">
                <ModelIcon type={plugin.iconType as ModelIconType} size="sm" />
                {plugin.label}
              </Flex>
            </AccordionTrigger>
            <AccordionContent>
              <plugin.settingsComponent />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Flex>
  );
};

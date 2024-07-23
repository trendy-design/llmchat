import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Flex } from "@/components/ui/flex";
import { usePreferenceContext } from "@/context";
import { GlobalSearchIcon, Image01Icon } from "@hugeicons/react";
import { SettingsContainer } from "../settings-container";
import { ImageGenerationPlugin } from "./image-generation";
import { WebSearchPlugin } from "./web-search";

export const PulginSettings = () => {
  const { apiKeys } = usePreferenceContext();
  const pluginSettingsData = [
    {
      value: "websearch",
      label: "Web Search",
      icon: GlobalSearchIcon,
      settingsComponent: WebSearchPlugin,
    },
    {
      value: "image_generation",
      label: "Image Generation",
      icon: Image01Icon,
      settingsComponent: ImageGenerationPlugin,
    },
  ];
  return (
    <SettingsContainer title="Plugins">
      <Accordion type="single" collapsible className="w-full">
        {pluginSettingsData.map((plugin) => {
          const Icon = plugin.icon;
          return (
            <AccordionItem key={plugin.value} value={plugin.value}>
              <AccordionTrigger>
                <Flex gap="sm" items="center">
                  {Icon && <Icon size={20} strokeWidth={1.5} />}
                  {plugin.label}
                </Flex>
              </AccordionTrigger>
              <AccordionContent>
                <plugin.settingsComponent />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </SettingsContainer>
  );
};

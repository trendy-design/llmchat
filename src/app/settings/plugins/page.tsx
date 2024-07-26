"use client";
import { ImageGenerationPlugin } from "@/components/settings/plugins/image-generation";
import { WebSearchPlugin } from "@/components/settings/plugins/web-search";
import { SettingsContainer } from "@/components/settings/settings-container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Flex } from "@/components/ui/flex";
import { AiImageIcon, Globe02Icon } from "@hugeicons/react";

export default function PulginSettings() {
  const pluginSettingsData = [
    {
      value: "websearch",
      label: "Web Search",
      icon: Globe02Icon,
      settingsComponent: WebSearchPlugin,
    },
    {
      value: "image_generation",
      label: "Image Generation",
      icon: AiImageIcon,
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
                <Flex gap="md" items="center">
                  {Icon && (
                    <Icon size={20} strokeWidth={2} className="opacity-50" />
                  )}
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
}

import { cn } from "@repo/shared/utils";
import { StaggerContainer } from "@repo/ui";
import { Brain, Globe, Image, LucideIcon } from "lucide-react";
import { ExplainationCard } from "./explaination-card";

type PluginItemProps = {
  icon: LucideIcon;
  text: string;
  color: string;
  explanation: string;
  initialRotate: 1 | -3 | -1;
  hoverRotate: -5 | 6 | 3;
};

const PluginItem = ({
  icon: Icon,
  text,
  color,
  explanation,
  initialRotate,
  hoverRotate,
}: PluginItemProps) => {
  return (
    <ExplainationCard explanation={explanation}>
      <div
        className={cn(
          "mx-1 flex flex-row items-center gap-1 rounded-full border border-zinc-500/20 bg-white px-2 py-0.5 text-sm font-medium shadow-sm dark:bg-zinc-800 md:px-2 md:py-1",
          "transition-all duration-300 ease-in-out",
          "transition-transform hover:z-10 hover:scale-105",

          {
            "!text-purple-500 dark:!text-purple-400": color === "purple",
            "!text-blue-500 dark:!text-blue-400": color === "blue",
            "!text-rose-400 dark:!text-rose-300": color === "rose",
          },
          {
            "rotate-1": initialRotate === 1,
            "-rotate-3": initialRotate === -3,
            "-rotate-1": initialRotate === -1,
          },
          {
            "hover:-rotate-5": hoverRotate === -5,
            "hover:rotate-6": hoverRotate === 6,
            "hover:rotate-3": hoverRotate === 3,
          },
        )}
      >
        <Icon size={14} strokeWidth={2} />
        {text}
      </div>
    </ExplainationCard>
  );
};

export const PluginCopy = () => {
  return (
    <StaggerContainer>
      Enhance your experience with plugins and personalized{" "}
      <PluginItem
        icon={Brain}
        text="memory"
        explanation="This plugin will help you personalize your experience by remembering your preferences and providing you with a more tailored experience."
        color="purple"
        initialRotate={1}
        hoverRotate={6}
      />
      : from{" "}
      <PluginItem
        icon={Globe}
        text="web search"
        explanation="This plugin will help you search the web for information."
        color="blue"
        initialRotate={-1}
        hoverRotate={-5}
      />{" "}
      to{" "}
      <PluginItem
        icon={Image}
        text="image generation"
        explanation="This plugin will help you generate images."
        color="rose"
        initialRotate={1}
        hoverRotate={3}
      />
      , tailored to your preferences.
    </StaggerContainer>
  );
};

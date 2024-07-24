import { SparklesIcon } from "@/components/ui/icons";
import { cn } from "@/helper/clsx";
import Image from "next/image";
export type ModelIconType =
  | "gpt3"
  | "gpt4"
  | "anthropic"
  | "gemini"
  | "openai"
  | "aichat"
  | "websearch"
  | "calculator"
  | "duckduckgo_search"
  | "website_reader"
  | "ollama"
  | "custom";

export type TModelIcon = {
  type: ModelIconType;
  size: "sm" | "md" | "lg";
};
export const ModelIcon = ({ type, size }: TModelIcon) => {
  const iconSrc = {
    gpt3: "/icons/gpt3.svg",
    gpt4: "/icons/gpt4.svg",
    anthropic: "/icons/claude.svg",
    gemini: "/icons/gemini.svg",
    openai: "/icons/openai.svg",
    aichat: "/icons/llmchat.png",
    websearch: "/icons/websearch.svg",
    calculator: "/icons/calculator.svg",
    duckduckgo_search: "/icons/duckduckgo.svg",
    website_reader: "/icons/website_reader.svg",
    ollama: "/icons/ollama.svg",
  };
  if (type === "custom") {
    return (
      <div
        className={cn(
          "min-w-6 h-6 bg-teal-500 text-white rounded-lg flex items-center justify-center",
          size === "sm" && "min-w-6 h-6",
          size === "md" && "min-w-8 h-8",
          size === "lg" && "min-w-10 h-10"
        )}
      >
        <SparklesIcon size={16} strokeWidth={1.5} variant="solid" />
      </div>
    );
  }

  return (
    <Image
      src={iconSrc[type]}
      width={0}
      height={0}
      alt={type}
      className={cn(
        "object-cover",
        size === "sm" && "min-w-6 h-6",
        size === "md" && "min-w-8 h-8",
        size === "lg" && "min-w-10 h-10"
      )}
      sizes="100vw"
    />
  );
};

import { cn } from "@/helper/clsx";
import Image from "next/image";
export type ModelIconType =
  | "gpt3"
  | "gpt4"
  | "anthropic"
  | "gemini"
  | "openai"
  | "llmchat"
  | "llmchatAccent"
  | "websearch"
  | "calculator"
  | "duckduckgo_search"
  | "website_reader"
  | "ollama";

export type TModelIcon = {
  type: ModelIconType;
  size: "sm" | "md" | "lg";
  base64?: string;
};
export const ModelIcon = ({ type, size, base64 }: TModelIcon) => {
  const iconSrc = {
    gpt3: "/icons/gpt3.svg",
    gpt4: "/icons/gpt4.svg",
    anthropic: "/icons/claude.svg",
    gemini: "/icons/gemini.svg",
    openai: "/icons/openai.svg",
    llmchat: "/icons/llmchat.svg",
    llmchatAccent: "/icons/llmchat-accent.svg",
    websearch: "/icons/websearch.svg",
    calculator: "/icons/calculator.svg",
    duckduckgo_search: "/icons/duckduckgo.svg",
    website_reader: "/icons/website_reader.svg",
    ollama: "/icons/ollama.svg",
  };

  return (
    <div className={cn("relative rounded-md",
      size === "sm" && "h-7 min-w-7",
      size === "md" && "h-8 min-w-8",
      size === "lg" && "h-10 min-w-10",
    )}>
      <div className="absolute inset-0 z-10 border border-zinc-800/10 rounded-md"></div>
      <Image
      src={base64 ? base64 : iconSrc[type]}
      width={0}
      height={0}
      alt={type}
      className={"object-cover relative w-full h-full rounded-md"}
      sizes="100vw"
    />
    </div>
  );
};

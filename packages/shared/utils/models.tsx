import { TModelKey, TProvider } from "@repo/shared/types";

export const getTestModelKey = (key: TProvider): TModelKey => {
  switch (key) {
    case "openai":
      return "gpt-3.5-turbo";
    case "anthropic":
      return "claude-3-haiku-20240307";
    case "gemini":
      return "gemini-pro";
    case "ollama":
      return "phi3:latest";
    case "groq":
      return "llama3-8b-8192";
    default:
      throw new Error("Invalid base model");
  }
};

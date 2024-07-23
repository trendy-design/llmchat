import { TBaseModel, TModelKey } from "@/types";

export const getTestModelKey = (key: TBaseModel): TModelKey => {
  switch (key) {
    case "openai":
      return "gpt-3.5-turbo";
    case "anthropic":
      return "claude-3-haiku-20240307";
    case "gemini":
      return "gemini-pro";
    case "ollama":
      return "phi3:latest";
    default:
      throw new Error("Invalid base model");
  }
};

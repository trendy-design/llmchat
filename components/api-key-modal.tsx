import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRootContext } from "@/libs/context/root";
import { ProviderSelect } from "./provider-select";
import { AnthropicSettings } from "./settings/models/anthropic";
import { GeminiSettings } from "./settings/models/gemini";
import { GroqSettings } from "./settings/models/groq";
import { OllamaSettings } from "./settings/models/ollama";
import { OpenAISettings } from "./settings/models/openai";

export const ApiKeyModal = () => {
  const {
    openApiKeyModal,
    setOpenApiKeyModal,
    apiKeyModalProvider = "openai",
    setApiKeyModalProvider,
  } = useRootContext();

  return (
    <Dialog open={openApiKeyModal} onOpenChange={setOpenApiKeyModal}>
      <DialogContent
        ariaTitle="Add API Key"
        className="no-scrollbar max-h-[80vh] !max-w-[460px] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Add API Key</DialogTitle>
        </DialogHeader>
        <ProviderSelect
          variant="bordered"
          selectedProvider={apiKeyModalProvider || "openai"}
          setSelectedProvider={setApiKeyModalProvider}
        />
        {apiKeyModalProvider === "openai" && <OpenAISettings />}
        {apiKeyModalProvider === "anthropic" && <AnthropicSettings />}
        {apiKeyModalProvider === "gemini" && <GeminiSettings />}
        {apiKeyModalProvider === "groq" && <GroqSettings />}
        {apiKeyModalProvider === "ollama" && (
          <OllamaSettings onRefresh={() => {}} />
        )}
      </DialogContent>
    </Dialog>
  );
};

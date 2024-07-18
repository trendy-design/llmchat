import { useToast } from "@/components/ui/use-toast";
import { TBaseModel } from "@/types";
import { useState } from "react";
import { useModelList } from "./use-model-list";

export const useLLMTest = () => {
  const { getTestModelKey, getModelByKey, createInstance } = useModelList();
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(false);
  const { toast } = useToast();
  const testLLM = async (model: TBaseModel, apiKey?: string) => {
    try {
      const modelKey = getTestModelKey(model);

      if (!apiKey) {
        return false;
      }

      const selectedModelKey = getModelByKey(modelKey);

      if (!selectedModelKey) {
        return false;
      }

      const selectedModel = await createInstance(selectedModelKey, apiKey);

      const data = await selectedModel
        .withListeners({
          onError: (error) => {
            console.error("error", error);
          },
        })
        .withConfig({
          recursionLimit: 2,
        })
        .invoke("This is Test Message", {
          callbacks: [
            {
              handleLLMError: (error) => {
                console.error("lll", error);
                throw new Error(error);
              },
            },
          ],
        });

      console.log(data);

      if (data) {
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const checkApiKey = async ({
    model,
    key,
    onValidated,
    onError,
  }: {
    model: TBaseModel;
    key: string;
    onValidated: () => void;
    onError: () => void;
  }) => {
    setIsCheckingApiKey(true);
    const isWorking = await testLLM(model, key);
    if (isWorking) {
      onValidated();
      toast({
        title: "API Key saved successfully",
        description: "Model is working as expected",
        variant: "default",
      });
    } else {
      onError();
      toast({
        title: "API Key Invalid",
        description: "Please check your API key and try again.",
        variant: "destructive",
      });
    }
    setIsCheckingApiKey(false);

    return (
      
    );
  };

  return { testLLM, checkApiKey, isCheckingApiKey };
};

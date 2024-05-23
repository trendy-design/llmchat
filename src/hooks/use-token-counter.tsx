import { encodingForModel } from "js-tiktoken";
import { TModelKey, useModelList } from "./use-model-list";

export const useTokenCounter = () => {
  const { getModelByKey } = useModelList();
  const getTokenCount = (message: string) => {
    const enc = encodingForModel("gpt-4o");
    if (message) {
      return enc.encode(message).length;
    }
    return undefined;
  };

  const countPricing = (
    token: number,
    modelKey: TModelKey,
    type: "input" | "output"
  ) => {
    const model = getModelByKey(modelKey);

    if (type === "input") {
      return Number((token * (model?.inputPrice || 0)) / 1000000) || 0;
    }

    return Number((token * (model?.outputPrice || 0)) / 1000000) || 0;
  };

  return {
    getTokenCount,
    countPricing,
  };
};

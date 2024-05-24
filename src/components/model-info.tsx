import { TModel } from "@/hooks/use-model-list";
import { formatNumber } from "@/lib/helper";

export type TModelInfo = {
  model: TModel;
  showDetails?: boolean;
};
export const ModelInfo = ({ model, showDetails = true }: TModelInfo) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 text-sm md:text-base items-center">
        {model.icon()} {model.name}
      </div>
      {showDetails && (
        <>
          <div className="flex flex-row justify-between text-sm md:text-base text-zinc-600 dark:text-zinc-400">
            <p className="">Tokens</p>
            <p>{formatNumber(model.tokens)} tokens</p>
          </div>
          <div className="flex flex-row justify-between text-sm md:text-base text-zinc-600 dark:text-zinc-400">
            <p className="">Model</p>
            <p>{model.key}</p>
          </div>
          {model.inputPrice && (
            <div className="flex flex-row justify-between text-sm md:text-base text-zinc-600 dark:text-zinc-400">
              <p className="">Input Price</p>
              <p>{model.inputPrice} USD / 1M tokens</p>
            </div>
          )}
          {model.outputPrice && (
            <div className="flex flex-row justify-between text-sm md:text-base text-zinc-600 dark:text-zinc-400">
              <p className="">Output Price</p>
              <p>{model.outputPrice} USD / 1M tokens</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

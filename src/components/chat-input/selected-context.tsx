import { Button } from "@/components/ui/button";
import { useChatContext } from "@/context";
import { ArrowMoveDownRightIcon, Cancel01Icon } from "@hugeicons/react";

export const SelectedContext = () => {
  const { store } = useChatContext();
  const contextValue = store((state) => state.context);
  const setContextValue = store((state) => state.setContext);

  if (!contextValue) return null;

  return (
    <div className="flex w-full flex-row items-start justify-start gap-2 rounded-xl border border-zinc-100 bg-white py-2 pl-2 pr-2 text-zinc-700 ring-1 ring-zinc-100 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 md:w-[700px] lg:w-[720px]">
      <ArrowMoveDownRightIcon size={16} strokeWidth={2} className="mt-1" />
      <p className="ml-2 line-clamp-2 w-full overflow-hidden text-sm md:text-base">
        {contextValue}
      </p>
      <Button
        size={"iconXS"}
        variant="ghost"
        onClick={() => {
          setContextValue("");
        }}
        className="ml-4 flex-shrink-0"
      >
        <Cancel01Icon size={14} strokeWidth={2} />
      </Button>
    </div>
  );
};

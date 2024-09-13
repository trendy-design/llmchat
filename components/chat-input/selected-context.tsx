import { useChatContext } from "@/lib/context";
import { Button } from "@/ui";
import { CornerDownRight, X } from "lucide-react";

export const SelectedContext = () => {
  const { store } = useChatContext();
  const contextValue = store((state) => state.context);
  const setContextValue = store((state) => state.setContext);

  if (!contextValue) return null;

  return (
    <div className="dark flex w-full flex-row items-start justify-start gap-2 rounded-xl border bg-zinc-700 py-2 pl-2 pr-2 text-zinc-200 md:w-[640px] lg:w-[700px]">
      <CornerDownRight size={16} strokeWidth={2} className="mt-1" />
      <p className="ml-2 line-clamp-2 w-full overflow-hidden text-sm">
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
        <X size={14} strokeWidth={2} />
      </Button>
    </div>
  );
};

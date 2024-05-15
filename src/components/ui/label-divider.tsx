import { cn } from "@/lib/utils";
export type TLabelDivider = {
  label: string;
  className?: string;
};
export const LabelDivider = ({ label, className }: TLabelDivider) => {
  return (
    <div
      className={cn("flex flex-row items-center w-full pb-4 pt-8", className)}
    >
      <div className="w-full h-[1px] bg-white/5"></div>
      <p className="text-xs text-zinc-500 px-2 flex-shrink-0">{label}</p>
      <div className="w-full h-[1px] bg-white/5"></div>
    </div>
  );
};

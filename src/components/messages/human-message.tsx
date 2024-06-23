import { TChatMessage } from "@/hooks";
import { Quotes } from "@phosphor-icons/react";
import Image from "next/image";

export type THumanMessage = {
  chatMessage: TChatMessage;
  isLast: boolean;
};
export const HumanMessage = ({ chatMessage }: THumanMessage) => {
  const { rawHuman, inputProps } = chatMessage;

  return (
    <>
      {inputProps?.context && (
        <div className="bg-zinc-50 text-zinc-600 dark:text-zinc-100 dark:bg-black/30 rounded-2xl p-2 pl-3 ml-16 md:ml-32 text-sm md:text-base flex flex-row gap-2 pr-4 border hover:border-white/5 border-transparent">
          <Quotes size={16} weight="bold" className="flex-shrink-0 mt-2" />

          <span className="pt-[0.35em] pb-[0.25em] leading-6">
            {inputProps?.context}
          </span>
        </div>
      )}
      {inputProps?.image && (
        <Image
          src={inputProps?.image}
          alt="uploaded image"
          className="rounded-2xl min-w-[120px] h-[120px] border dark:border-white/10 border-black/10 shadow-sm object-cover"
          width={0}
          sizes="50vw"
          height={0}
        />
      )}
      <div className="bg-zinc-50 text-zinc-600 dark:text-zinc-100 dark:bg-black/30 ml-16 md:ml-32 rounded-2xl text-sm md:text-base flex flex-row gap-2 px-3 py-2">
        <span className="pt-[0.20em] pb-[0.15em] leading-6 whitespace-pre-wrap">
          {rawHuman}
        </span>
      </div>
    </>
  );
};

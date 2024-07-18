import { Flex } from "@/components/ui/flex";
import { TChatMessage } from "@/types";
import { Quotes } from "@phosphor-icons/react";
import Image from "next/image";

export type THumanMessage = {
  chatMessage: TChatMessage;
  isLast: boolean;
};
export const HumanMessage = ({ chatMessage, isLast }: THumanMessage) => {
  const { rawHuman, runConfig } = chatMessage;

  return (
    <>
      {runConfig?.context && (
        <div className="bg-zinc-50 text-zinc-600 dark:text-zinc-100 dark:bg-black/30 rounded-2xl p-2 pl-3 ml-16 md:ml-32 text-sm md:text-base flex flex-row gap-2 pr-4 border hover:border-white/5 border-transparent">
          <Quotes size={16} weight="bold" className="flex-shrink-0 mt-2" />

          <span className="pt-[0.35em] pb-[0.25em] leading-6">
            {runConfig?.context}
          </span>
        </div>
      )}
      {runConfig?.image && (
        <div className="rounded-2xl relative min-w-[120px] h-[120px] border border-white/5  shadow-md">
          <Image
            src={runConfig?.image}
            alt="uploaded image"
            className="w-full h-full object-cover rounded-2xl overflow-hidden"
            width={0}
            sizes="50vw"
            height={0}
          />
        </div>
      )}
      <Flex className="ml-16 md:ml-32" gap="xs" items="center">
        <div className="bg-zinc-50 text-zinc-600 dark:text-zinc-100 dark:bg-black/30  rounded-2xl text-sm md:text-base flex flex-row gap-2 px-3 py-2">
          <span className="pt-[0.20em] pb-[0.15em] leading-6 whitespace-pre-wrap">
            {rawHuman}
          </span>
        </div>
      </Flex>
    </>
  );
};

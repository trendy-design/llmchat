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
        <div className="ml-16 flex flex-row gap-2 rounded-lg border border-transparent bg-zinc-50 p-2 pl-3 pr-4 text-sm text-zinc-600 hover:border-white/5 dark:bg-black/30 dark:text-zinc-100 md:ml-32 md:text-base">
          <Quotes size={16} weight="bold" className="mt-2 flex-shrink-0" />

          <span className="pb-[0.25em] pt-[0.35em] leading-6">
            {runConfig?.context}
          </span>
        </div>
      )}
      {runConfig?.image && (
        <div className="relative h-[120px] min-w-[120px] rounded-lg border border-white/5 shadow-md">
          <Image
            src={runConfig?.image}
            alt="uploaded image"
            className="h-full w-full overflow-hidden rounded-xl object-cover"
            width={0}
            sizes="50vw"
            height={0}
          />
        </div>
      )}
      <Flex className="ml-16 md:ml-32" gap="xs" items="center">
        <div className="flex flex-row gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:bg-black/30 dark:text-zinc-100 md:text-base">
          <span className="whitespace-pre-wrap pb-[0.15em] pt-[0.20em] leading-6">
            {rawHuman}
          </span>
        </div>
      </Flex>
    </>
  );
};

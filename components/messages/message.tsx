import { TChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils/clsx";
import { Flex } from "@/ui";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { FC, forwardRef } from "react";
import { AIMessage } from "./ai/ai-message";
import { ContextMessage } from "./context-message";
import { HumanMessage } from "./human-message";
import { ImageMessage } from "./image-message";

export type TMessage = {
  message: TChatMessage;
  isLast: boolean;
};

const CustomTrigger = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof AccordionTrigger>
>(({ children, ...props }, ref) => (
  <AccordionHeader className="flex w-full">
    <AccordionTrigger
      {...props}
      ref={ref}
      className="group flex w-full items-start justify-between"
    >
      <Flex className="w-full flex-1 items-start">{children}</Flex>
      <Flex
        className="mt-1 h-6 w-10 shrink-0 px-2"
        items="center"
        justify="center"
      >
        <ChevronsUpDown
          size={20}
          strokeWidth={1.5}
          className="opacity-50 transition-transform duration-200 hover:opacity-100 group-data-[state=open]:hidden"
        />
        <ChevronsDownUp
          size={20}
          strokeWidth={1.5}
          className="opacity-50 transition-transform duration-200 hover:opacity-100 group-data-[state=closed]:hidden"
        />
      </Flex>
    </AccordionTrigger>
  </AccordionHeader>
));

CustomTrigger.displayName = "CustomTrigger";

export const Message: FC<TMessage> = ({ message, isLast }) => {
  return (
    <Accordion
      type="single"
      className="w-full"
      collapsible
      defaultValue={message.id}
    >
      <AccordionItem
        value={message.id}
        key={message.id}
        className={cn(
          "flex w-full flex-col items-start gap-1 border-b border-zinc-500/15 py-8",
          isLast && "border-b-0",
        )}
      >
        <CustomTrigger>
          <Flex direction="col" gap="md" items="start">
            <ImageMessage image={message.runConfig?.image} />

            <ContextMessage context={message.runConfig?.context} />

            <HumanMessage chatMessage={message} />
          </Flex>
        </CustomTrigger>
        <AccordionContent className="w-full items-start">
          <AIMessage message={message} isLast={isLast} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

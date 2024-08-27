import { slideUpVariant } from "@/lib/utils/animations";
import { HoverCard, HoverCardContent, HoverCardTrigger, Type } from "@/ui";
import { motion } from "framer-motion";
export type ExplainationCard = {
  explanation: string;
  children: React.ReactNode;
};

export const ExplainationCard = ({
  explanation,
  children,
}: ExplainationCard) => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <span className="inline-block cursor-pointer">{children}</span>
      </HoverCardTrigger>
      <HoverCardContent sideOffset={14} asChild>
        <motion.div
          variants={slideUpVariant}
          className="dark max-w-[300px] rounded-lg bg-zinc-700 p-2"
        >
          <Type>{explanation}</Type>
        </motion.div>
      </HoverCardContent>
    </HoverCard>
  );
};

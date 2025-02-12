import { useScrollToBottom } from "@/lib/hooks";
import { Button } from "@repo/ui";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export const ScrollToBottomButton = () => {
  const { scrollToBottom, showScrollToBottom } = useScrollToBottom();

  if (!showScrollToBottom) return null;

  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      <Button
        onClick={scrollToBottom}
        variant="bordered"
        size="icon-xs"
        rounded="full"
      >
        <ArrowDown size={16} strokeWidth="2" />
      </Button>
    </motion.span>
  );
};

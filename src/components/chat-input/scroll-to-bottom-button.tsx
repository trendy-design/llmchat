import { useScrollToBottom } from "@/hooks";
import { ArrowDown02Icon } from "@hugeicons/react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

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
        size="iconSm"
        variant="outlined"
        rounded="full"
      >
        <ArrowDown02Icon size={16} strokeWidth="2" />
      </Button>
    </motion.span>
  );
};

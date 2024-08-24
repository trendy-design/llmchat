import { useChatContext } from "@/lib/context";
import { Button } from "@/ui";
import { StopIcon } from "@hugeicons/react";
import { motion } from "framer-motion";

export const StopGenerationButton = () => {
  const { store } = useChatContext();
  const stopGeneration = store((state) => state.stopGeneration);
  const isGenerating = store((state) => state.isGenerating);

  if (!isGenerating) return null;

  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      <Button
        rounded="full"
        variant="secondary"
        size="sm"
        onClick={() => {
          stopGeneration();
        }}
      >
        <StopIcon size={16} variant="solid" />
        Stop generation
      </Button>
    </motion.span>
  );
};

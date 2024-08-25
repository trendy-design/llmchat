import { slideUpVariant } from "@/lib/utils/animations";
import { Flex, StaggerContainer, Tooltip } from "@/ui";
import { motion } from "framer-motion";
import { ModelIcon, ModelIconType } from "../model-icon";

export const AiModelsCopy = () => {
  const modelList = ["gpt4", "anthropic", "ollama", "gemini", "groq"];

  return (
    <>
      Engage with a diverse range of AI models
      <span className="relative inline-block h-4 w-[160px]">
        <StaggerContainer>
          <Flex className="absolute left-0 top-0 mx-4 -translate-y-1">
            {modelList?.map((model, index) => {
              return (
                <Tooltip key={model} content={model}>
                  <motion.div
                    key={model}
                    variants={slideUpVariant}
                    className="mr-[-8px] w-full rounded-md"
                    initial={{
                      rotate: -5 + index * 2,
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                    animate={{
                      rotate: -5 + index * 2,
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                    whileHover={{
                      scale: 1.1,
                      rotate: -5 + index * 2 + 5,
                      zIndex: 10,
                      boxShadow: "0 10px 15px rgba(0, 0, 0, 0.2)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ModelIcon
                      type={model as ModelIconType}
                      size="md"
                      rounded={false}
                    />
                  </motion.div>
                </Tooltip>
              );
            })}
          </Flex>
        </StaggerContainer>
      </span>
      —just bring your own API keys and dive in!
    </>
  );
};

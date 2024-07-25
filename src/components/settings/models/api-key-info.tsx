import { Flex } from "@/components/ui";

export const ApiKeyInfo = () => {
  return (
    <Flex className="text-xs" gap="xs">
      <p className="font-semibold text-zinc-500">FYI:</p>
      <p className="text-xs text-zinc-300 font-medium">
        Your API Key is stored locally on your browser and never sent anywhere
        else.
      </p>
    </Flex>
  );
};

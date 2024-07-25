import { Flex } from "@/components/ui/flex";
import { Type } from "@/components/ui/text";
import { examplePrompts } from "@/config";
import { useChatContext } from "@/context";
import { Button } from "./ui";

export const ChatExamples = () => {
  const { store } = useChatContext();
  const editor = store((state) => state.editor);

  return (
    <Flex direction="col" gap="md" justify="center" items="start" className="w-full md:w-[700px] lg:w-[720px]">
        <Type size="sm" textColor="tertiary" className="px-3">
          Try Prompts
        </Type>
        <div className="md:grid flex flex-row justify-start overflow-x-auto md:grid-cols-2 gap-3 w-full p-1">
          {examplePrompts?.slice(0, 4)?.map((prompt, index) => (
            <Button
              key={index}
              rounded="full"
              className="justify-start"
              onClick={() => {
                editor?.commands?.clearContent();
                editor?.commands?.setContent(prompt.content);
                editor?.commands?.focus("end");
              }}
            >
              {prompt.name}
            </Button>
          ))}
        </div>
    </Flex>
  );
};

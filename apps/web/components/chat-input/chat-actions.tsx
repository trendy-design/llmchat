import { useChatContext, usePromptsContext } from "@/lib/context";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Flex, Kbd } from "@repo/ui";
import { ArrowUp, CircleStop } from "lucide-react";
import { ImageUpload } from "./image-upload";

export type TChatActions = {
  sendMessage: (message: string) => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const ChatActions = ({
  sendMessage,
  handleImageUpload,
}: TChatActions) => {
  const { store, isReady } = useChatContext();
  const isGenerating = store((state) => state.isGenerating);
  const editor = store((state) => state.editor);
  const { open: openPrompts } = usePromptsContext();

  const stopGeneration = store((state) => state.stopGeneration);

  const hasTextInput = !!editor?.getText();

  return (
    <Flex
      className="w-full px-1 pb-1 pt-1 md:px-2 md:pb-2"
      items="center"
      justify="between"
    >
     
      <Flex gap="xs" items="center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="xs" variant="bordered">
            Deepseek R1
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom">
          <DropdownMenuItem>Deepseek R1</DropdownMenuItem>
          <DropdownMenuItem>OpenAI GPT-4o</DropdownMenuItem>
          <DropdownMenuItem>Claude 3.5 Sonnet</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

        <ImageUpload
          id="image-upload"
          label="Upload Image"
          tooltip="Upload Image"
          showIcon
          handleImageUpload={handleImageUpload}
        />
      </Flex>

      <Flex gap="md" items="center">
        {editor?.getText() && <p className="text-xs text-gray-500 items-center flex flex-row gap-1">
          use
        <Kbd>
          Shift + Enter
        </Kbd> 
        for new line
        </p>}
       
        {isGenerating ? (
          <Button size="xs" variant="secondary" onClick={stopGeneration}>
            <CircleStop size={14} strokeWidth={2} /> Stop
          </Button>
        ) : (
          <Button
            size="xs"
            variant={hasTextInput ? "default" : "secondary"}
            disabled={!isReady || !hasTextInput || isGenerating}
            onClick={() => {
              editor?.getText() && sendMessage(editor?.getText());
            }}
          >
            <ArrowUp size={14} strokeWidth="2" /> Send
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

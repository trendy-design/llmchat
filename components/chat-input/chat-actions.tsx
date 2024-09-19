import { useChatContext, usePromptsContext } from "@/lib/context";
import { Button, Flex, Tooltip } from "@/ui";
import { ArrowUp, Book, CircleStop } from "lucide-react";
import { AudioRecorder } from "./audio-recorder";
import { ImageUpload } from "./image-upload";

export type TChatActions = {
  sendMessage: (message: string) => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const ChatActions = ({
  sendMessage,
  handleImageUpload,
}: TChatActions) => {
  const { store } = useChatContext();
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
        <AudioRecorder sendMessage={sendMessage} />

        <ImageUpload
          id="image-upload"
          label="Upload Image"
          tooltip="Upload Image"
          showIcon
          handleImageUpload={handleImageUpload}
        />
        <Tooltip content="Prompts">
          <Button
            size="iconSm"
            variant="ghost"
            onClick={() => {
              openPrompts();
            }}
          >
            <Book size={16} strokeWidth="2" />
          </Button>
        </Tooltip>
      </Flex>

      <Flex gap="xs" items="center">
        {isGenerating ? (
          <Button size="sm" variant="secondary" onClick={stopGeneration}>
            <CircleStop size={16} strokeWidth={2} /> Stop
          </Button>
        ) : (
          <Button
            size="sm"
            variant={hasTextInput ? "default" : "secondary"}
            disabled={!hasTextInput || isGenerating}
            onClick={() => {
              editor?.getText() && sendMessage(editor?.getText());
            }}
          >
            <ArrowUp size={16} strokeWidth="2" /> Send
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

import { useChatStore } from '@/libs/store/chat.store';
import { models } from '@repo/ai/models';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Kbd,
} from '@repo/ui';
import { ArrowUp, CircleStop } from 'lucide-react';
import { ImageUpload } from './image-upload';

export type TChatActions = {
  sendMessage: (message: string) => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const ChatActions = ({ sendMessage, handleImageUpload }: TChatActions) => {
  const isGenerating = useChatStore(state => state.isGenerating);
  const editor = useChatStore(state => state.editor);
  const setModel = useChatStore(state => state.setModel);
  const model = useChatStore(state => state.model);
  const stopGeneration = useChatStore(state => state.stopGeneration);

  const hasTextInput = !!editor?.getText();

  return (
    <Flex
      className="w-full px-1 pb-1 pt-1.5 md:px-2 md:pb-2"
      items="center"
      justify="between"
    >
      <Flex gap="xs" items="center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="xs" variant="bordered">
              {model.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom">
            {models.map(model => (
              <DropdownMenuItem key={model.id} onClick={() => setModel(model)}>
                {model.name}
              </DropdownMenuItem>
            ))}
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
        {editor?.getText() && (
          <p className="flex flex-row items-center gap-1 text-xs text-gray-500">
            use
            <Kbd>Shift + Enter</Kbd>
            for new line
          </p>
        )}

        {isGenerating ? (
          <Button size="xs" variant="secondary" onClick={stopGeneration}>
            <CircleStop size={14} strokeWidth={2} /> Stop
          </Button>
        ) : (
          <Button
            size="icon-sm"
            rounded="full"
            variant={hasTextInput ? 'default' : 'secondary'}
            disabled={!hasTextInput || isGenerating}
            onClick={() => {
              editor?.getText() && sendMessage(editor?.getText());
            }}
          >
            <ArrowUp size={14} strokeWidth="2" />
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

import { useChatStore } from '@/libs/store/chat.store';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Kbd,
} from '@repo/ui';
import { IconBolt, IconChevronDown, IconPlayerStopFilled, IconSchool } from '@tabler/icons-react';
import { ArrowUp } from 'lucide-react';
import { ImageUpload } from './image-upload';

export type TChatActions = {
  sendMessage: (message: string) => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export type ChatMode = 'deep' | 'fast' | 'gpt-4o-mini';

export const ChatActions = ({ sendMessage, handleImageUpload }: TChatActions) => {
  const isGenerating = useChatStore(state => state.isGenerating);
  const editor = useChatStore(state => state.editor);
  const chatMode = useChatStore(state => state.chatMode);
  const setChatMode = useChatStore(state => state.setChatMode);
  const stopGeneration = useChatStore(state => state.stopGeneration);

  const hasTextInput = !!editor?.getText();

  const chatOptions = [
    {
      label: "Deep Research",
      value: "deep",
      icon: <IconSchool size={14} strokeWidth={2} className="text-blue-400" />
    },
    {
      label: "Fast Research",
      value: "fast",
      icon: <IconBolt size={14} strokeWidth={2} className="text-emerald-500" />
    },
    {
      label: "GPT-4o Mini",
      value: "gpt-4o-mini",
    },
    
  ]

  return (
    <Flex className="w-full px-1 pb-1 pt-1.5 md:px-2 md:pb-2" items="center" justify="between">
      <Flex gap="xs" items="center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="xs" variant="bordered">
              {chatOptions.find(option => option.value === chatMode)?.icon}
              {chatOptions.find(option => option.value === chatMode)?.label}
              <IconChevronDown size={12} strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom">
            {chatOptions.map(option => (
              <DropdownMenuItem key={option.label} onSelect={()=>{
                setChatMode(option.value as ChatMode);
              }}>
                {option.icon}
                {option.label}
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
            <div className="inline-flex flex-row gap-1">
            <Kbd>Shift</Kbd>
            <Kbd>Enter</Kbd>
            </div>
            for new line
          </p>
        )}

        {isGenerating ? (
          <Button   size="icon-sm"
          variant="default"
          rounded="full"onClick={stopGeneration}>
            <IconPlayerStopFilled size={14} strokeWidth={2} /> 
          </Button>
        ) : (
          <Button
            size="icon-sm"
            rounded="full"
            variant={hasTextInput ? 'default' : 'secondary'}
            disabled={!hasTextInput || isGenerating}
            onClick={() => {
            if (editor?.getText()) {
                sendMessage(editor.getText());
            }
            }}
          >
            <ArrowUp size={14} strokeWidth="2" />
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

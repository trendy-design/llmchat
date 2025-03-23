import { ToolsMenu } from '@/components/tools-menu';
import { ChatMode, useChatStore } from '@/libs/store/chat.store';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Flex,
  Kbd
} from '@repo/ui';
import { IconArrowUp, IconCheck, IconChevronDown, IconPaperclip, IconPlayerStopFilled, IconWorld } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { memo, useState } from 'react';
import { DeepResearchIcon } from '../icons';
import { DotSpinner } from '../thread/step-status';


export const chatOptions = [
  {
    label: "Deep Research",
    description: "In depth research on complex topic",
    value: ChatMode.Deep,
    icon: <DeepResearchIcon />,
  },

]

export const modelOptions = [
  {
    label: "Gemini Flash 2.0",
    value: ChatMode.GEMINI_2_FLASH,
    // webSearch: true,
    icon: undefined
  },

  {
    label: "GPT 4o Mini",
    value: ChatMode.GPT_4o_Mini,
    // webSearch: true,
    icon: undefined
  },

  {
    label: "O3 Mini",
    value: ChatMode.O3_Mini,
    // webSearch: true,
    icon: undefined
  },

  {
    label: "Claude 3.5 Sonnet",
    value: ChatMode.CLAUDE_3_5_SONNET,
    // webSearch: true,
    icon: undefined
  },

  {
    label: "Deepseek R1",
    value: ChatMode.DEEPSEEK_R1,
    // webSearch: true,
    icon: undefined
  },

  {
    label: "Claude 3.7 Sonnet",
    value: ChatMode.CLAUDE_3_7_SONNET,
    // webSearch: true,
    icon: undefined
  }

]

export type TChatActions = {
  sendMessage: (message: string) => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};


export const ChatActions = memo(({ sendMessage }: TChatActions) => {
  const pathname = usePathname();
  const isGenerating = useChatStore(state => state.isGenerating);
  const editor = useChatStore(state => state.editor);
  const chatMode = useChatStore(state => state.chatMode);
  const setChatMode = useChatStore(state => state.setChatMode);
  const stopGeneration = useChatStore(state => state.stopGeneration);
  const [isChatModeOpen, setIsChatModeOpen] = useState(false);
  const hasTextInput = !!editor?.getText();
  const isChatPage = pathname.startsWith('/chat');
  const useWebSearch = useChatStore(state => state.useWebSearch);
  const setUseWebSearch = useChatStore(state => state.setUseWebSearch);


  return (
    <Flex className="w-full px-2 py-2 gap-0" gap="none" items="center" justify="between">
      {(isGenerating && !isChatPage) ? <GeneratingStatus /> : <Flex gap="xs" items="center">
        <DropdownMenu open={isChatModeOpen} onOpenChange={setIsChatModeOpen}>
      <DropdownMenuTrigger asChild>
      <Button variant={isChatModeOpen ? "secondary" : "ghost"} size="sm" rounded="full">
            {[...chatOptions, ...modelOptions].find(option => option.value === chatMode)?.icon}
            {[...chatOptions, ...modelOptions].find(option => option.value === chatMode)?.label}
            <IconChevronDown size={16} strokeWidth={2} />
          </Button>
      </DropdownMenuTrigger>
      <ChatModeOptions chatMode={chatMode} setChatMode={setChatMode} />
        </DropdownMenu>
        <Button size="icon" tooltip="Attachment (coming soon)" variant="ghost" className='gap-2' rounded="full" disabled>
          <IconPaperclip size={18} strokeWidth={2} className="text-muted-foreground"/>
        </Button>
        <Button size="icon" tooltip="Web Search" variant={useWebSearch ? "secondary" : "ghost"} className='gap-2' rounded="full" onClick={() => setUseWebSearch(!useWebSearch)}>
          <IconWorld size={18} strokeWidth={2} className="text-muted-foreground" />
        </Button>
        <ToolsMenu />

      </Flex>}

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

        {(isGenerating && !isChatPage) ? (
          <Button size="icon"
            rounded="full"
            variant="default"
            onClick={stopGeneration}>
            <IconPlayerStopFilled size={14} strokeWidth={2} />
          </Button>
        ) : (
          <Button
            size="icon"
            rounded="full"
            variant={hasTextInput ? 'default' : 'secondary'}
            disabled={!hasTextInput || isGenerating}
            onClick={() => {
              if (editor?.getText()) {
                sendMessage(editor.getText());
              }
            }}
          >
            <IconArrowUp size={20} strokeWidth={2} />
          </Button>
        )}
      </Flex>
    </Flex>
  );
});


export const GeneratingStatus = () => {
  return (
    <div className='text-xs text-muted-foreground flex flex-row gap-1 items-center px-2'><DotSpinner /> Generating...</div>
  )
}


export const ChatModeOptions = ({
  chatMode,
  setChatMode,

}: {
  chatMode: ChatMode;
  setChatMode: (chatMode: ChatMode) => void;
}) => {



  return (

      <DropdownMenuContent align="start" side="bottom" className='w-[320px]'>
        {chatOptions.map(option => (
          <DropdownMenuItem key={option.label} onSelect={() => {
            setChatMode(option.value);
          }} className='h-auto'>
            <div className='flex flex-row w-full items-start gap-1.5 py-1.5 px-1.5'>
              <div className='flex flex-col pt-1 gap-0'>
              {option.icon}
              </div>

              <div className='flex flex-col gap-0'>
                {<p className='text-sm font-medium m-0'>{option.label}</p>}
                {option.description && <p className='text-xs font-light text-muted-foreground'>{option.description}</p>}
              </div>
            </div>

          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {modelOptions.map(option => (
          <DropdownMenuItem key={option.label} onSelect={() => {
            setChatMode(option.value);
          }} className='h-auto'>
            <div className='flex flex-row w-full items-center gap-2.5 py-1.5 px-1.5'>

              <div className='flex flex-col gap-0'>
                {<p className='text-sm font-medium'>{option.label}</p>}
              </div>
              <div className='flex-1' />
              {chatMode === option.value && <IconCheck size={14} strokeWidth={2} className="text-brand" />}
            </div>

          </DropdownMenuItem>
        ))}

      </DropdownMenuContent>
  )
}
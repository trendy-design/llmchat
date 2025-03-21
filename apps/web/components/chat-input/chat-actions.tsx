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
import { IconArrowBack, IconCheck, IconChevronDown, IconCodeDots, IconGlobe, IconPlayerStopFilled, IconTools, IconWorld } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { DotSpinner } from '../thread/step-status';

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



  const hasTextInput = !!editor?.getText();

  const chatOptions = [
    {
      label: "Deep Research",
      description: "Advance reserch",
      value:  ChatMode.Deep,
      icon: <IconWorld size={16} strokeWidth={2} className="text-blue-400" />,
      webSearch: true,
    },
    
  ]

  const modelOptions = [
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

  const isChatPage = pathname.startsWith('/chat');


  return (
    <Flex className="w-full p-2 border-border bg-secondary/50 border-t" items="center" justify="between">
        {(isGenerating && !isChatPage) ? <GeneratingStatus /> : <Flex gap="xs" items="center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="xs" variant="ghost">
              {[...chatOptions, ...modelOptions].find(option => option.value === chatMode)?.icon}
              {[...chatOptions, ...modelOptions].find(option => option.value === chatMode)?.label}
              <IconChevronDown size={12} strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom" className='w-[320px]'>
            {chatOptions.map(option => (
              <DropdownMenuItem key={option.label} onSelect={()=>{
                setChatMode(option.value);
              }} className='h-auto'>
                <div className='flex flex-row w-full items-center gap-2.5 py-1.5 px-1.5'>
                {option.icon}

                  <div className='flex flex-col gap-0'> 
                  {<p className='text-sm font-medium'>{option.label}</p>}
                  {option.description && <p className='text-xs text-muted-foreground'>{option.description}</p>}
                  </div>
                  <div className='flex-1' />
                  {option.webSearch && <IconGlobe size={14} strokeWidth={2} className="text-muted-foreground" />}
                </div>
             
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator/>
            {modelOptions.map(option => (
              <DropdownMenuItem key={option.label} onSelect={()=>{
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
        </DropdownMenu>
        <Button size="xs" variant="ghost" className='pl-1 pr-2 gap-2'>
          <div className='bg-blue-500/20 border-blue-500/30 border rounded-md p-0.5 size-5 flex items-center justify-center'>
          <IconWorld size={20} strokeWidth={2} className="text-blue-500" /> 
          </div>
          Web Search
        </Button>
        <ToolsMenu />

{/* 
        <ImageUpload
          id="image-upload"
          label="Upload Image"
          tooltip="Upload Image"
          showIcon
          handleImageUpload={handleImageUpload}
        /> */}
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
          <Button   size="xs"
          variant="default"
         onClick={stopGeneration}>
            <IconPlayerStopFilled size={14} strokeWidth={2} /> Stop
          </Button>
        ) : (
          <Button
            size="xs"
            variant={hasTextInput ? 'default' : 'secondary'}
            disabled={!hasTextInput || isGenerating}
            onClick={() => {
            if (editor?.getText()) {
                sendMessage(editor.getText());
            }
            }}
          >
            Send <IconArrowBack size={12} strokeWidth={2} />
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

export const ToolIcon = ({className}: {className?: string}) => {
  return (
    <div className={`bg-yellow-500/20 border-yellow-500/30 border rounded-md p-0.5 size-5 flex items-center justify-center ${className}`}>
    <IconTools size={20} strokeWidth={2} className="text-yellow-600" /> 
    </div>
  )
}

export const ToolResultIcon = () => {
  return (
    <div className='bg-emerald-500/20 border-emerald-500/30 border rounded-md p-0.5 size-5 flex items-center justify-center'>
    <IconCodeDots size={20} strokeWidth={2} className="text-emerald-600" /> 
    </div>
  )
}
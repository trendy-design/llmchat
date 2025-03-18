import { ChatMode, useChatStore } from '@/libs/store/chat.store';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Flex,
  Kbd,
} from '@repo/ui';
import { IconArrowBack, IconBolt, IconChevronDown, IconGlobe, IconPlayerStopFilled, IconSchool } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { DotSpinner } from '../thread/step-status';
import { ImageUpload } from './image-upload';

export type TChatActions = {
  sendMessage: (message: string) => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};


export const ChatActions = ({ sendMessage, handleImageUpload }: TChatActions) => {
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
      icon: <IconSchool size={16} strokeWidth={2} className="text-blue-400" />,
      webSearch: true,
    },
    {
      label: "Fast Research",
      description: "Quick web research",
      value:   ChatMode.Fast,
      icon: <IconBolt size={16} strokeWidth={2} className="text-emerald-500" />,
      webSearch: true,
    }
    
  ]

  const modelOptions = [
    {
      label: "Gemini Flash 2.0",
      value: ChatMode.GEMINI_2_FLASH,
      webSearch: true,
      icon: undefined
    },

    {
      label: "GPT 4o Mini",
      value: ChatMode.GPT_4o_Mini,
      webSearch: true,
      icon: undefined
    }
    
  ]

  const isChatPage = pathname.startsWith('/chat');

  console.log("isChatPage", isChatPage)

  return (
    <Flex className="w-full bg-secondary/50 border-t border-border p-1.5" items="center" justify="between">
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
                  {option.webSearch && <IconGlobe size={14} strokeWidth={2} className="text-muted-foreground" />}
                </div>
             
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
};


export const GeneratingStatus = () => {
  return (
    <div className='text-xs text-muted-foreground flex flex-row gap-1 items-center px-2'><DotSpinner /> Generating...</div>
  )
}
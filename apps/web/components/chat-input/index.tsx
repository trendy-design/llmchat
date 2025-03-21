import { useAgentStream } from '@/hooks/agent-provider';
import { useChatEditor, useImageAttachment } from '@/lib/hooks';
import { useChatStore } from '@/libs/store/chat.store';
import { cn, slideUpVariant } from '@repo/shared/utils';
import { Flex } from '@repo/ui';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ChatActions } from './chat-actions';
import { ChatEditor } from './chat-editor';
import { ChatFooter } from './chat-footer';
import { ImageAttachment } from './image-attachment';
import { ImageDropzoneRoot } from './image-dropzone-root';
import { SelectedContext } from './selected-context';

export const ChatInput = ({showGreeting = true}: {showGreeting?: boolean}) => {
  const { threadId: currentThreadId } = useParams();
  const { editor } = useChatEditor();
  const { attachment, clearAttachment, handleImageUpload, dropzonProps } = useImageAttachment();
  const threadItems = useChatStore(state => state.threadItems);
  const { handleSubmit } = useAgentStream();
  const model = useChatStore(state => state.model);
  const chatMode = useChatStore(state => state.chatMode);
  const abortController = useChatStore(state => state.abortController);
  const createThread = useChatStore(state => state.createThread);
  
  const router = useRouter();
  const sendMessage = async () => {
    if(!editor?.getText()) {
      return;
    }

    let threadId = currentThreadId?.toString();

    if(!threadId) {
      const newThread = await createThread({
        title: editor?.getText()
      });
      threadId = newThread.id;
    }
  
    // First submit the message
    const formData = new FormData();
    formData.append('query', editor.getText());
    handleSubmit(formData, threadId);
    editor.commands.clearContent();
    if(currentThreadId !== threadId) { 
      router.push(`/c/${threadId}`);
    }
  };

  const renderChatInput = () => (
    <div className=" w-full">
      <Flex direction="col" className="bg-background w-full rounded-xl border border-border">
        <motion.div
          variants={slideUpVariant}
          initial="initial"
          animate={editor?.isEditable ? 'animate' : 'initial'}
          className="flex w-full flex-shrink-0 overflow-hidden rounded-xl"
        >
          <ImageDropzoneRoot dropzoneProps={dropzonProps}>
            <Flex direction="col" className="w-full">
              <ImageAttachment attachment={attachment} clearAttachment={clearAttachment} />
              <Flex className="flex w-full flex-row items-end gap-0 p-3 md:pl-3">
                <ChatEditor sendMessage={sendMessage} editor={editor} />
              </Flex>
              <ChatActions
                sendMessage={sendMessage}
                handleImageUpload={handleImageUpload}
              />
            </Flex>
          </ImageDropzoneRoot>
        </motion.div>
      </Flex>
    </div>
  );

  const renderChatBottom = () => (
    <>
      <Flex items="center" justify="center" gap="sm" className="mb-2">
        {/* <ScrollToBottomButton /> */}
      </Flex>
      <SelectedContext />
      {renderChatInput()}
    </>
  );

  return (
    <div
      className={cn(
        'flex w-full flex-col items-start',
        !threadItems?.length && 'h-[calc(100vh-12rem)] justify-start'
      )}
    >
      <Flex
        items="start"
        justify="start"
        direction="col"
        gap="sm"
        className={cn('w-full', threadItems?.length > 0 ? 'mb-2' : 'h-full')}
      >
        {showGreeting && (
          <div className='flex flex-col gap-2'>
          <h1 className="text-3xl font-medium font-sg tracking-tight opacity-30">Good Morning,</h1>
          <h1 className="text-3xl font-medium font-sg tracking-tight">How can i help you?</h1>
          </div>
        )}

        {renderChatBottom()}
        
        <ChatFooter />
      </Flex>
    </div>
  );
};

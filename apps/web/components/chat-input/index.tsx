import { useAgentStream } from '@/hooks/agent-provider';
import { useChatEditor, useImageAttachment } from '@/lib/hooks';
import { useChatStore } from '@/libs/store/chat.store';
import { cn, slideUpVariant } from '@repo/shared/utils';
import { Flex } from '@repo/ui';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { MessagesRemainingBadge } from '../messages-remaining-badge';
import { ChatActions } from './chat-actions';
import { ChatEditor } from './chat-editor';
import { ImageAttachment } from './image-attachment';
import { ImageDropzoneRoot } from './image-dropzone-root';

export const ChatInput = ({ showGreeting = true, showBottomBar = true }: { showGreeting?: boolean, showBottomBar?: boolean }) => {
  const { threadId: currentThreadId } = useParams();
  const { editor } = useChatEditor();
  const { attachment, clearAttachment, handleImageUpload, dropzonProps } = useImageAttachment();
  const getThreadItems = useChatStore(state => state.getThreadItems);
  const threadItemsLength = useChatStore(useShallow(state => state.threadItems.length));
  const { handleSubmit } = useAgentStream();
  const createThread = useChatStore(state => state.createThread);

  const router = useRouter();
  const sendMessage = async () => {
    if (!editor?.getText()) {
      return;
    }

    let threadId = currentThreadId?.toString();

    if (!threadId) {
      const newThread = await createThread({
        title: editor?.getText()
      });
      threadId = newThread.id;
    }

    // First submit the message
    const formData = new FormData();
    formData.append('query', editor.getText());
    const threadItems = await getThreadItems(threadId);
    handleSubmit({
      formData,
      newThreadId: threadId,
      messages: threadItems
    });
    editor.commands.clearContent();
    if (currentThreadId !== threadId) {
      router.push(`/c/${threadId}`);
    }
  };

  const renderChatInput = () => (
    <div className=" w-full">
      <Flex direction="col" className="bg-background z-10 relative w-full rounded-2xl border border-hard">
        <motion.div
          variants={slideUpVariant}
          initial="initial"
          animate={editor?.isEditable ? 'animate' : 'initial'}
          className="flex w-full  flex-shrink-0 overflow-hidden rounded-xl"
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
      {showBottomBar && <div className="flex flex-row mx-1.5 items-center h-10 px-2 pt-2 -mt-2 rounded-b-2xl border-x bg-yellow-700/5  border-b border-yellow-900/20 gap-2">
        <span className="text-xs font-light px-2">
        <MessagesRemainingBadge />

        </span>
       
      </div>}
    </div>
  );

  const renderChatBottom = () => (
    <>
      <Flex items="center" justify="center" gap="sm">
        {/* <ScrollToBottomButton /> */}
      </Flex>
      {renderChatInput()}
    </>
  );

  return (
    <div
      className={cn(
        'flex w-full flex-col items-start',
        !threadItemsLength && 'justify-start'
      )}
    >
      <Flex
        items="start"
        justify="start"
        direction="col"
        className={cn('w-full pb-4', threadItemsLength > 0 ? 'mb-0' : 'h-full')}
      >
        {showGreeting && (
          <div className='flex flex-col w-full items-center gap-1 mb-8'>
            <h1 className="text-3xl font-medium font-sg tracking-tight text-foreground/50">Good morning,</h1>
            <h1 className="text-3xl font-medium font-sg tracking-tight text-foreground">How can i help you?</h1>
          </div>
        )}

        {renderChatBottom()}



        {/* <ChatFooter /> */}
      </Flex>
    </div>
  );
};

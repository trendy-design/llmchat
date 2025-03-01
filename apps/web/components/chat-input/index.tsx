import { useAgentStream } from '@/hooks/use-agent';
import { useChatEditor, useImageAttachment } from '@/lib/hooks';
import { Block, ThreadItem, useChatStore } from '@/libs/store/chat.store';
import { cn, slideUpVariant } from '@repo/shared/utils';
import { Flex } from '@repo/ui';
import { motion } from 'framer-motion';
import { nanoid } from 'nanoid';
import { useCallback, useState } from 'react';
import { ChatActions } from './chat-actions';
import { ChatEditor } from './chat-editor';
import { ChatFooter } from './chat-footer';
import { ImageAttachment } from './image-attachment';
import { ImageDropzoneRoot } from './image-dropzone-root';
import { SelectedContext } from './selected-context';

export const ChatInput = () => {
  const { editor } = useChatEditor();
  const { attachment, clearAttachment, handleImageUpload, dropzonProps } = useImageAttachment();
  const threadItems = useChatStore(state => state.threadItems);
  const createThreadItem = useChatStore(state => state.createThreadItem);
  const setCurrentThreadItem = useChatStore(state => state.setCurrentThreadItem);
  const currentThreadId = useChatStore(state => state.currentThreadId);
  const setIsGenerating = useChatStore(state => state.setIsGenerating);
  const { runAgent } = useAgentStream();
  const thread = useChatStore(state => state.currentThread);
  const updateThread = useChatStore(state => state.updateThread);
  const model = useChatStore(state => state.model);
  const chatMode = useChatStore(state => state.chatMode);
  const [responseNodesMap] = useState(() => new Map<string, Map<string, Block>>());
  const setCurrentSources = useChatStore(state => state.setCurrentSources);
  const handleSubmit = (formData: FormData) => {
    const optimisticUserThreadItemId = nanoid();
    const optimisticAiThreadItemId = nanoid();

    if(threadItems?.length === 0 && thread?.id) {
      updateThread({
        id: thread.id,
        title: formData.get('query') as string,
      });
    }

    // Clear previous nodes for this thread item
    responseNodesMap.set(optimisticAiThreadItemId, new Map<string, Block>());

    const userThreadItem: ThreadItem = {
      id: optimisticUserThreadItemId,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'user' as const,
      content: [
        {
          id: optimisticUserThreadItemId,
          content: formData.get('query') as string,
          nodeKey: optimisticUserThreadItemId,
        },
      ],
      status: 'completed' as const,
      threadId: currentThreadId || 'default',
    };

    const aiThreadItem: ThreadItem = {
      id: optimisticAiThreadItemId,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'assistant' as const,
      content: [],
      status: 'pending' as const,
      threadId: currentThreadId || 'default',
    };

    createThreadItem(userThreadItem);
    createThreadItem(aiThreadItem);
    setCurrentThreadItem(userThreadItem);
    setIsGenerating(true);
    setCurrentSources([]);

    runAgent({
      messages: [],
      prompt: formData.get('query') as string,
      threadId: currentThreadId || 'default',
      threadItemId: optimisticAiThreadItemId,
      parentThreadItemId: optimisticUserThreadItemId,
    });
  };

  const onSubmit = useCallback(() => {
    if (!editor) {
      return;
    }

    const formData = new FormData();
    formData.append('query', editor.getText());
    handleSubmit(formData);
    editor.commands.clearContent();
  }, [editor, currentThreadId, model, chatMode]);

  const renderChatInput = () => (
    <div className="bg-secondary w-full rounded-2xl border border-border p-1">
      <Flex direction="col" className="bg-background w-full rounded-xl border border-border shadow-sm">
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
                <ChatEditor sendMessage={() => {}} editor={editor} />
              </Flex>
              <ChatActions
                sendMessage={() => {
                  onSubmit();
                }}
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
        'flex w-full flex-col items-center',
        !threadItems?.length && 'h-[calc(100vh-12rem)] justify-center'
      )}
    >
      <Flex
        items="center"
        justify="center"
        direction="col"
        gap="sm"
        className={cn('w-full', threadItems?.length > 0 ? 'mb-2' : 'h-full')}
      >
        {!threadItems?.length && (
          <h1 className="text-3xl font-medium font-sg tracking-tight">How can i help you?</h1>
        )}

        {renderChatBottom()}
        <ChatFooter />
      </Flex>
    </div>
  );
};

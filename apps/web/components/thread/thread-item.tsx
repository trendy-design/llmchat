import { useAgentStream } from '@/hooks/agent-provider';
import { useCopyText } from '@/hooks/use-copy-text';
import { mdxComponents } from '@/libs/mdx/mdx-components';
import { parseSourceTagsFromXML } from '@/libs/mdx/sources';
import { useMdxChunker } from '@/libs/mdx/use-mdx-chunks';
import { ChatMode, GoalWithSteps, ThreadItem as ThreadItemType, ToolCall, ToolResult, useChatStore } from '@/libs/store/chat.store';
import { Badge, Button, cn, DropdownMenu, DropdownMenuTrigger, RadioGroup, RadioGroupItem, Textarea } from '@repo/ui';
import { IconCaretDownFilled, IconCheck, IconCopy, IconPencil, IconQuestionMark, IconRefresh, IconSquare, IconTrash } from '@tabler/icons-react';
import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote/rsc';
import { serialize } from 'next-mdx-remote/serialize';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import remarkGfm from 'remark-gfm';
import { ChatModeOptions, ToolIcon, ToolResultIcon } from '../chat-input/chat-actions';
import { CodeBlock } from '../code-block/code-block';
import { CitationProvider } from './citation-provider';
import { GoalsRenderer } from './goals';

type NestedMDXRemoteSerializeResult =
  | MDXRemoteSerializeResult
  | {
    source: string;
    tag: string;

    tagProps: Record<string, string>;
    children: NestedMDXRemoteSerializeResult[];
  };


export const AIThreadItem = ({ content, className }: { content: string, className?: string }) => {
  const animatedText = content ?? '';
  const sources = useMemo(() => {
    return parseSourceTagsFromXML(content);
  }, [content]);
  const [serializedMdx, setSerializedMdx] = useState<MDXRemoteSerializeResult | null>(null);
  // const { text: animatedText, isDone } = useAnimatedText(content);
  const [mdxSources, setMdxSources] = useState<NestedMDXRemoteSerializeResult[]>([]);
  const [cachedChunks, setCachedChunks] = useState<Map<string, MDXRemoteSerializeResult>>(
    new Map()
  );
  const { chunkMdx } = useMdxChunker();
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    (async () => {
      try {
        const mdx = await serialize(animatedText, { mdxOptions: { remarkPlugins: [remarkGfm] } });
        setSerializedMdx(mdx);
      } catch (error) {
        console.error('Error serializing MDX:', error);
      }
    })();
  }, [animatedText]);

  if (!serializedMdx) {
    return null;
  }

  return (
    <>
      <div 
        ref={contentRef}
        className={cn("animate-fade-in prose prose-sm prose-p:font-light prose-p:tracking-[0.01em] prose-headings:tracking-[0.005em] prose-prosetheme prose-headings:text-base prose-headings:font-medium prose-strong:font-medium prose-th:font-medium min-w-full prose-code:font-mono prose-code:text-sm prose-code:font-normal prose-code:bg-secondary prose-code:border-border prose-code:border prose-code:rounded-lg prose-code:p-0.5", className)}
      >
        <MDXRemote {...serializedMdx} components={mdxComponents} />
      </div>
    </>
  );
};

const MemoizedMdxChunk = memo(({ source }: { source: MDXRemoteSerializeResult }) => {
  if (!source) {
    return null;
  }
  return <MDXRemote {...source} components={mdxComponents} />;
});

MemoizedMdxChunk.displayName = 'MemoizedMdxChunk';

export const ThreadItem = ({ threadItem }: { isAnimated: boolean; threadItem: ThreadItemType }) => {
  const setCurrentSources = useChatStore(state => state.setCurrentSources);
  const messageRef = useRef<HTMLDivElement>(null);
  const { copyToClipboard, status } = useCopyText();
  const [chatMode, setChatMode] = useState<ChatMode>(ChatMode.Deep);
  const { handleSubmit } = useAgentStream();
  const removeThreadItem = useChatStore(state => state.deleteThreadItem);
  useEffect(() => {
    const sources = threadItem.steps
      ?.filter((step) => step.type === 'read')
      .flatMap((step) => step.results?.map((result) => result.link))
      .filter((link): link is string => link !== undefined) || [];
    return setCurrentSources(sources);
  }, [threadItem]);

  const goalsWithSteps: GoalWithSteps[] = useMemo(() => {
    return threadItem.goals?.map((goal) => ({
      ...goal,
      steps: threadItem.steps?.filter((step) => step.goalId === goal.id) || []
    })) || []
  }, [threadItem.goals, threadItem.steps]);

  const hasAnswer = useMemo(() => {
    return threadItem.answer?.text && threadItem.answer?.text.length > 0;
  }, [threadItem.answer]);

  const hasClarifyingQuestions = useMemo(() => {
    return threadItem.answer?.object?.clarifyingQuestion && threadItem.answer?.objectType === 'clarifyingQuestions';
  }, [threadItem.answer]);

  const allSources = useMemo(() => {
    const sourceMatches = threadItem.answer?.text?.match(/<Source>([^]*?)<\/Source>/g) || [];

    // Extract only the content between the Source tags
    return sourceMatches.map(match => {
      const content = match.replace(/<Source>([^]*?)<\/Source>/, '$1').trim();
      return content;
    });
  }, [threadItem.answer?.text]);


  const toolCallAndResults = useMemo(() => {
    return Object.entries(threadItem?.toolCalls || {}).map(([key, toolCall]) => {
      const toolResult = threadItem?.toolResults?.[key];
      return {
        toolCall,
        toolResult
      }
    });
  }, [threadItem?.toolCalls, threadItem?.toolResults]);



  return (
    <>
      {threadItem.query && (
        <UserMessage message={threadItem.query} />
      )}

      <div className="flex w-full flex-col gap-4">

        <GoalsRenderer goals={goalsWithSteps || []} reasoning={threadItem?.reasoning} />

       {
        toolCallAndResults?.map((toolCallAndResult) => (
          <div className='flex flex-col gap-1'>
            <ToolCallRenderer toolCall={toolCallAndResult.toolCall} />
            {toolCallAndResult.toolResult && <ToolResultRenderer toolResult={toolCallAndResult.toolResult} />}
          </div>
        ))
       }

<div ref={messageRef} className='w-full'>
        {hasAnswer && <CitationProvider sources={allSources}>

          {threadItem.answer?.text && <AIThreadItem content={threadItem.answer?.text || ''} key={`answer-${threadItem.id}`} />}
        
        </CitationProvider>
        }
        </div>
        {hasClarifyingQuestions && <ClarifyingQuestions options={threadItem.answer?.object?.clarifyingQuestion?.options || []} question={threadItem.answer?.object?.clarifyingQuestion?.question || ''} type={threadItem.answer?.object?.clarifyingQuestion?.type || 'single'} />}
        <div className='flex flex-row items-center gap-2'>
      
          <Button variant='secondary' size='icon-sm' rounded='full' onClick={() => {
            if (messageRef.current) {
              copyToClipboard(messageRef.current);
            }
          }} tooltip={status === "copied"? "Copied" : "Copy"}>
            {status === "copied"? <IconCheck size={16} strokeWidth={2} /> : <IconCopy size={16} strokeWidth={2} />}
          </Button>
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <Button variant='secondary' size='icon-sm' rounded='full' tooltip="Rewrite">
            <IconRefresh size={16} strokeWidth={2} />
          </Button>
          </DropdownMenuTrigger>
        <ChatModeOptions chatMode={chatMode} setChatMode={(mode) => {
          setChatMode(mode);
          const formData = new FormData();
          formData.append('query', threadItem.query || '');
          handleSubmit({
            formData,
            existingThreadItemId: threadItem.id,
            newChatMode: mode as any
          });
        }} />

        </DropdownMenu>
        <Button  variant='secondary' size='icon-sm' rounded='full' onClick={() => {
            removeThreadItem(threadItem.id);
          }} tooltip="Remove">
            <IconTrash size={16} strokeWidth={2} />
          </Button>
          <p className='text-xs text-muted-foreground'>{threadItem.mode}</p>
        </div>
      </div>
    </>
  );
};

export const UserMessage = ({ message }: { message: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const maxHeight = 200;
  const { copyToClipboard, status } = useCopyText();

  useEffect(() => {
    if (messageRef.current) {
      setShowExpandButton(messageRef.current.scrollHeight > maxHeight);
    }
  }, [message]);

  return (
    <div className="flex w-full group flex-col items-end gap-2 py-4">
     
      <div className="relative text-foreground max-w-[90%]">
        <div
          ref={messageRef}
          className="rounded-xl relative overflow-hidden px-4 py-3 bg-background border border-border text-base font-normal"
          style={{
            maxHeight: isExpanded ? 'none' : maxHeight,
            transition: 'max-height 0.3s ease-in-out'
          }}
        >
          {message}
          {showExpandButton && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pointer-events-none">
            <div className="w-full h-12 px-2 bg-gradient-to-b from-transparent via-background/85 to-background flex items-center justify-end">
              <Button
                variant="secondary"
                size="xs"
                rounded="full"
                className="pointer-events-auto relative z-10 px-4"
                onClick={() => setIsExpanded(true)}
              >
                Show more
              </Button>
            </div>
          </div>
        )}
        
        {showExpandButton && isExpanded && (
            <div className="w-full h-12 px-2 bg-gradient-to-b from-transparent via-background/85 to-background flex items-center justify-end">
            <Button
              variant="secondary"
              size="xs"
              rounded="full"
              className="px-4"
              onClick={() => setIsExpanded(false)}
            >
              Show less
            </Button>
          </div>
        )}
        </div>
        
      
      </div>
      <div className="flex flex-row gap-2 py-1 group-hover:opacity-100 opacity-0 transition-opacity duration-300">
        <Button variant='secondary' size="icon-sm" rounded='full' onClick={() => {
          if (messageRef.current) {
            copyToClipboard(messageRef.current);
          }
        }} tooltip={status === "copied"? "Copied" : "Copy"}>
          {status === "copied"? <IconCheck size={14} strokeWidth={2} /> : <IconCopy size={14} strokeWidth={2} />}
        </Button>
     
        <Button variant='secondary' size='icon-sm' rounded='full' tooltip="Edit">
          <IconPencil size={14} strokeWidth={2} />
        </Button>
       
      </div>
    </div>
  );
};

export const ClarifyingQuestions = ({ options, question, type }: { options: string[], question: string, type: 'single' | 'multiple' }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customOption, setCustomOption] = useState<string>("");
  const [isCustomSelected, setIsCustomSelected] = useState<boolean>(false);
  const { handleSubmit } = useAgentStream();


  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    setIsCustomSelected(value === "custom");
  };

  const renderRadioGroup = () => {
    return <RadioGroup
      value={selectedOption || ""}
      onValueChange={handleOptionChange}
      className="flex flex-col gap-2"
    >
      {options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <RadioGroupItem value={option} id={`option-${index}`} />
          <p className='text-sm'>{option}</p>
        </div>
      ))}

      <div className="flex items-center space-x-2">
        <RadioGroupItem value="custom" id="option-custom" />
        <p className='text-sm'>Custom option</p>
      </div>
    </RadioGroup>
  }

  const renderCheckboxGroup = () => {
    return <div className='flex flex-row flex-wrap gap-2'>
      {options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-border" onClick={() => {
          if (selectedOptions.includes(option)) {
            setSelectedOptions(selectedOptions.filter((o) => o !== option));
          } else {
            setSelectedOptions([...selectedOptions, option]);
          }
        }}>
          
          {selectedOptions.includes(option) ? <IconCheck size={16} strokeWidth={2} className="text-brand" /> : <IconSquare size={16} strokeWidth={2} className="text-muted-foreground/20" />}
          <p className='text-sm'>{option}</p>
        </div>
      ))}
    </div>
  }

  return (
    <div className="flex flex-col items-start gap-4 mt-2 border border-border bg-background rounded-2xl p-4 w-full">
      <div className='flex flex-row items-center gap-1'>
        <IconQuestionMark size={16} strokeWidth={2} className="text-brand" />
        <p className='text-sm text-muted-foreground'>Follow up Question</p>
      </div>

      <p className='text-base'>{question}</p>

      {type === 'single' ? renderRadioGroup() : renderCheckboxGroup()}

      <div className="w-full mt-2">
        <Textarea
          value={customOption}
          onChange={(e) => setCustomOption(e.target.value)}
          placeholder="Enter additional feedback"
          className="w-full px-3 py-2 h-[100px] !border !border-border rounded-lg"
        />
      </div>


      <Button
        disabled={!selectedOption && !selectedOptions.length && !customOption}
        size='sm'
        rounded='full'
        onClick={() => {
          let query = '';
          if (type === 'single') {
            query = `${selectedOption} \n\n ${customOption}`
          } else {
            query = `${selectedOptions.join(', ')} \n\n ${customOption}`
          }
          const formData = new FormData();
          formData.append('query', query);
          handleSubmit({
            formData,
          });
        }}
      >
        Submit
      </Button>
    </div>
  );
};


export const ToolCallRenderer = ({toolCall}: {toolCall: ToolCall}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className='flex flex-col bg-background items-start px-2.5 pt-3 pb-3 rounded-xl border border-border'>
      <div 
        className='flex flex-row items-center gap-2.5 w-full justify-between cursor-pointer' 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className='flex flex-row items-center gap-2.5'>
          <ToolIcon />
          <Badge>Tool Use</Badge>
          <p className='text-xs font-medium text-foreground'>{toolCall.toolName}</p>
        </div>
        <div className='pr-2'>
          <IconCaretDownFilled size={14} strokeWidth={2} className={`text-muted-foreground transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {isOpen && (
        <div className='flex flex-row items-center gap-2.5 w-full mt-2'>
          <CodeBlock variant='secondary' showHeader={false} lang='json' code={JSON.stringify(toolCall.args, null, 2)}></CodeBlock>
        </div>
      )}
    </div>
  )
}

export const ToolResultRenderer = ({toolResult}: {toolResult: ToolResult}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className='flex flex-col bg-background items-start px-2.5 pt-3 pb-3 rounded-xl border border-border'>
      <div 
        className='flex flex-row items-center gap-2.5 w-full justify-between cursor-pointer'
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className='flex flex-row items-center gap-2.5'>
          <ToolResultIcon />
          <Badge>Tool Result</Badge>
          <p className='text-xs font-medium text-foreground'>{toolResult.toolName}</p>
        </div>
        <div className='pr-2'>
          <IconCaretDownFilled size={14} strokeWidth={2} className={`text-muted-foreground transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {isOpen && (
        <div className='flex flex-row items-center gap-2.5 w-full mt-2'>
          <CodeBlock variant='secondary' showHeader={false} lang='json' code={JSON.stringify(toolResult.result, null, 2)}></CodeBlock>
        </div>
      )}
    </div>
  )
}
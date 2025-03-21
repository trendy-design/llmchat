import { useAgentStream } from '@/hooks/use-agent';
import { mdxComponents } from '@/libs/mdx/mdx-components';
import { parseSourceTagsFromXML } from '@/libs/mdx/sources';
import { useMdxChunker } from '@/libs/mdx/use-mdx-chunks';
import { GoalWithSteps, ThreadItem as ThreadItemType, ToolCall, ToolResult, useChatStore } from '@/libs/store/chat.store';
import { Badge, Button, cn, RadioGroup, RadioGroupItem, Textarea } from '@repo/ui';
import { IconBook, IconCheck, IconQuestionMark, IconSquare } from '@tabler/icons-react';
import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote/rsc';
import { serialize } from 'next-mdx-remote/serialize';
import { memo, useEffect, useMemo, useState } from 'react';
import remarkGfm from 'remark-gfm';
import { ToolIcon, ToolResultIcon } from '../chat-input/chat-actions';
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

  console.log('sourcessss', sources);

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


  // const fixedMdx = useMemo(
  //   () =>
  //     sanitizeMDX(
  //       animatedText?.replaceAll('<think>', '\n\n<Think>').replaceAll('</think>', '\n\n</Think>')
  //     ),
  //   [animatedText]
  // );

  // const processChunk = async (chunks: MdxChunk[]): Promise<NestedMDXRemoteSerializeResult[]> => {
  //   const results: NestedMDXRemoteSerializeResult[] = [];

  //   for (const chunk of chunks || []) {
  //     if (typeof chunk === 'string') {
  //       let chunkSource = chunk;
  //       chunkSource = chunkSource
  //         .replaceAll('<think>', '\n\n<Think>')
  //         .replaceAll('</think>', '\n\n</Think>');
  //       const cachedChunk = cachedChunks.get(chunkSource);
  //       if (cachedChunk) {
  //         results.push(cachedChunk as NestedMDXRemoteSerializeResult);
  //         continue;
  //       }
  //       const mdx = await serialize(chunkSource, {
  //         mdxOptions: {
  //           remarkPlugins: [remarkGfm],
  //         },
  //       });

  //       setCachedChunks(prev => new Map(prev).set(chunkSource, mdx));
  //       results.push(mdx);
  //     } else {
  //       // Process nested chunks first
  //       const childResults = await processChunk(chunk.children);

  //       if (chunk.mdxTag === 'Think') {
  //         // For Think components, create a wrapper that preserves the children
  //         const nestedResult: NestedMDXRemoteSerializeResult = {
  //           source: '',
  //           tag: 'Think',
  //           tagProps: chunk.mdxProps || {},
  //           children: childResults,
  //         };
  //         results.push(nestedResult);
  //       } else {
  //         // For other nested structures
  //         results.push(...childResults);
  //       }
  //     }
  //   }

  //   return results;
  // };

  // useEffect(() => {
  //   (async () => {
  //     if (fixedMdx) {
  //       const chunks = await chunkMdx(fixedMdx);
  //       console.log('chunks', chunks);

  //       if (!chunks) {
  //         return;
  //       }

  //       const mdxSources = await processChunk(chunks.chunks);
  //       setMdxSources(mdxSources);
  //     }
  //   })();
  // }, [fixedMdx]);


  // const renderMdxSource = (source: NestedMDXRemoteSerializeResult) => {

  //   if ('tag' in source && source.tag === 'Think') {
  //     const CustomComponent = mdxComponents![
  //       source.tag as keyof typeof mdxComponents
  //     ] as React.ComponentType<any>;
  //     const customComponentProps = source.tagProps;
  //     return (
  //       <CustomComponent {...customComponentProps}>
  //         {source.children.map((child, index) => (
  //           <Fragment key={index}>{renderMdxSource(child)}</Fragment>
  //         ))}
  //       </CustomComponent>
  //     );
  //   }
  //   if ('compiledSource' in source) {
  //     console.log('child compiledSource', source);
  //     return <MemoizedMdxChunk source={source} />;
  //   }
  //   return null;
  // };


  if (!serializedMdx) {
    return null;
  }

  return (
    <div className={cn("animate-fade-in prose prose-sm prose-p:font-light prose-p:tracking-[0.01em] prose-headings:tracking-[0.005em] prose-prosetheme prose-headings:text-base prose-headings:font-medium prose-strong:font-medium prose-th:font-medium min-w-full prose-code:font-mono prose-code:text-sm prose-code:font-normal prose-code:bg-secondary prose-code:border-border prose-code:border prose-code:rounded-lg prose-code:p-0.5", className)}>
      <MDXRemote {...serializedMdx} components={mdxComponents} />
    </div>
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
        <div className="flex w-full flex-row justify-start py-8">
          <div className="text-foreground rounded-xl text-xl font-normal">
            {threadItem.query}
          </div>
        </div>
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

        {hasAnswer && !hasClarifyingQuestions && <div className='flex flex-row items-center gap-1'>
          <IconBook size={16} strokeWidth={2} className="text-brand" />
          <p className='text-sm text-muted-foreground'>Answer</p>
        </div>}
        {hasAnswer && <CitationProvider sources={allSources}>

          {threadItem.answer?.text && <AIThreadItem content={threadItem.answer?.text || ''} key={`answer-${threadItem.id}`} />}
        
        </CitationProvider>
        }
        {hasClarifyingQuestions && <ClarifyingQuestions options={threadItem.answer?.object?.clarifyingQuestion?.options || []} question={threadItem.answer?.object?.clarifyingQuestion?.question || ''} type={threadItem.answer?.object?.clarifyingQuestion?.type || 'single'} />}
      </div>
    </>
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
        <div key={index} className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-border" onClick={() => {
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
    <div className="flex flex-col items-start gap-4 mt-2 border border-border rounded-2xl p-8 w-full">
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
          placeholder="Enter your custom response..."
          className="w-full px-3 py-2 h-[100px] border rounded-lg"
        />
      </div>


      <Button
        disabled={!selectedOption && !selectedOptions.length && !customOption}
        onClick={() => {
          let query = '';
          if (type === 'single') {
            query = `${selectedOption} \n\n ${customOption}`
          } else {
            query = `${selectedOptions.join(', ')} \n\n ${customOption}`
          }
          const formData = new FormData();
          formData.append('query', query);
          handleSubmit(formData);
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
    <div className='flex flex-col bg-background items-start px-2.5 pt-2 pb-2 rounded-lg border border-border'>
      <div 
        className='flex flex-row items-center gap-2.5 w-full justify-between cursor-pointer' 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className='flex flex-row items-center gap-2.5'>
          <ToolIcon />
          <Badge>Tool Use</Badge>
          <p className='text-sm text-muted-foreground'>{toolCall.toolName}</p>
        </div>
        <div className='pr-2'>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
    <div className='flex flex-col bg-background items-start px-2.5 pt-2 pb-2 rounded-lg border border-border'>
      <div 
        className='flex flex-row items-center gap-2.5 w-full justify-between cursor-pointer'
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className='flex flex-row items-center gap-2.5'>
          <ToolResultIcon />
          <Badge>Tool Result</Badge>
          <p className='text-sm text-muted-foreground'>{toolResult.toolName}</p>
        </div>
        <div className='pr-2'>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
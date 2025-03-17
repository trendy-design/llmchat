import { mdxComponents } from '@/libs/mdx/mdx-components';
import { parseSourceTagsFromXML } from '@/libs/mdx/sources';
import { useMdxChunker } from '@/libs/mdx/use-mdx-chunks';
import { GoalWithSteps, ThreadItem as ThreadItemType, useChatStore } from '@/libs/store/chat.store';
import { cn } from '@repo/ui';
import { IconBook } from '@tabler/icons-react';
import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote/rsc';
import { serialize } from 'next-mdx-remote/serialize';
import { memo, useEffect, useMemo, useState } from 'react';
import remarkGfm from 'remark-gfm';
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
    setCurrentSources(threadItem.metadata?.searchResults?.map((result: any) => result.link) || []);
  }, [threadItem]);

  const goalsWithSteps:GoalWithSteps[] = useMemo(() => {
    return threadItem.goals?.map((goal) => ({
      ...goal,
      steps: threadItem.steps?.filter((step) => step.goalId === goal.id) || []
    })) || []
  }, [threadItem.goals, threadItem.steps]);

  const hasAnswer = useMemo(() => {
    return threadItem.answer?.text && threadItem.answer?.text.length > 0;
  }, [threadItem.answer]);

  const allSources = useMemo(() => {
    const sourceMatches = threadItem.answer?.text?.match(/<Source>(.*?)<\/Source>/gs) || [];
    
    // Extract only the content between the Source tags
    return sourceMatches.map(match => {
      const content = match.replace(/<Source>(.*?)<\/Source>/s, '$1').trim();
      return content;
    });
  }, [threadItem.answer?.text]);

  

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

          {hasAnswer && <div className='flex flex-row items-center gap-1'>
            <IconBook size={16} strokeWidth={2} className="text-brand" />
            <p className='text-sm text-muted-foreground'>Answer</p>
          </div>}
          {hasAnswer && <CitationProvider sources={allSources}>

              <AIThreadItem content={threadItem.answer?.text || ''} key={`answer-${threadItem.id}`} />
            </CitationProvider>
          }
        </div>
    </>
  );
};

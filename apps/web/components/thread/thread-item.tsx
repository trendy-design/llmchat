import { mdxComponents } from '@/libs/mdx/mdx-components';
import { sanitizeMDX } from '@/libs/mdx/mdx-sanitization';
import { parseSourceTagsFromXML } from '@/libs/mdx/sources';
import { MdxChunk, useMdxChunker } from '@/libs/mdx/use-mdx-chunks';
import { ThreadItem as ThreadItemType, useChatStore } from '@/libs/store/chat.store';
import { cn } from '@repo/ui';
import { IconBook } from '@tabler/icons-react';
import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote/rsc';
import { serialize } from 'next-mdx-remote/serialize';
import { Fragment, memo, useEffect, useMemo, useState } from 'react';
import remarkGfm from 'remark-gfm';
import { SourcesStack } from '../sources-stack';
import { CitationProvider } from './citation-provider';
import { Steps } from './steps';

type NestedMDXRemoteSerializeResult =
  | MDXRemoteSerializeResult
  | {
    source: string;
    tag: string;

    tagProps: Record<string, string>;
    children: NestedMDXRemoteSerializeResult[];
  };

export const AIThreadItem = ({ content }: { content: string }) => {
  const animatedText = content ?? '';
  const sources = useMemo(() => {
    return parseSourceTagsFromXML(content);
  }, [content]);
  // const { text: animatedText, isDone } = useAnimatedText(content);
  const [mdxSources, setMdxSources] = useState<NestedMDXRemoteSerializeResult[]>([]);
  const [cachedChunks, setCachedChunks] = useState<Map<string, MDXRemoteSerializeResult>>(
    new Map()
  );
  const { chunkMdx } = useMdxChunker();

  console.log('sourcessss', sources);

  const fixedMdx = useMemo(
    () =>
      sanitizeMDX(
        animatedText?.replaceAll('<think>', '\n\n<Think>').replaceAll('</think>', '\n\n</Think>')
      ),
    [animatedText]
  );

  const processChunk = async (chunks: MdxChunk[]): Promise<NestedMDXRemoteSerializeResult[]> => {
    const results: NestedMDXRemoteSerializeResult[] = [];

    for (const chunk of chunks || []) {
      if (typeof chunk === 'string') {
        let chunkSource = chunk;
        chunkSource = chunkSource
          .replaceAll('<think>', '\n\n<Think>')
          .replaceAll('</think>', '\n\n</Think>');
        const cachedChunk = cachedChunks.get(chunkSource);
        if (cachedChunk) {
          results.push(cachedChunk as NestedMDXRemoteSerializeResult);
          continue;
        }
        const mdx = await serialize(chunkSource, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        });

        setCachedChunks(prev => new Map(prev).set(chunkSource, mdx));
        results.push(mdx);
      } else {
        // Process nested chunks first
        const childResults = await processChunk(chunk.children);

        if (chunk.mdxTag === 'Think') {
          // For Think components, create a wrapper that preserves the children
          const nestedResult: NestedMDXRemoteSerializeResult = {
            source: '',
            tag: 'Think',
            tagProps: chunk.mdxProps || {},
            children: childResults,
          };
          results.push(nestedResult);
        } else {
          // For other nested structures
          results.push(...childResults);
        }
      }
    }

    return results;
  };

  useEffect(() => {
    (async () => {
      if (fixedMdx) {
        const chunks = await chunkMdx(fixedMdx);
        console.log('chunks', chunks);

        if (!chunks) {
          return;
        }

        const mdxSources = await processChunk(chunks.chunks);
        setMdxSources(mdxSources);
      }
    })();
  }, [fixedMdx]);

  if (mdxSources.length === 0) {
    return null;
  }

  const renderMdxSource = (source: NestedMDXRemoteSerializeResult) => {
    if ('tag' in source && source.tag === 'Think') {
      const CustomComponent = mdxComponents![
        source.tag as keyof typeof mdxComponents
      ] as React.ComponentType<any>;
      const customComponentProps = source.tagProps;
      return (
        <CustomComponent {...customComponentProps}>
          {source.children.map((child, index) => (
            <Fragment key={index}>{renderMdxSource(child)}</Fragment>
          ))}
        </CustomComponent>
      );
    }
    if ('compiledSource' in source) {
      console.log('child compiledSource', source);
      return <MemoizedMdxChunk source={source} />;
    }
    return null;
  };

  return (
    <div className="animate-fade-in prose prose-prosetheme prose-sm min-w-full">
      {mdxSources.map((source, index) => (
        <Fragment key={index}>{renderMdxSource(source)}</Fragment>
      ))}
      <div className="flex flex-col items-start justify-start">
        <SourcesStack urls={sources} />
      </div>
    </div>
  );
};

export const AIThreadItemV2 = ({ content, className }: { content: string, className?: string }) => {
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
    <div className={cn("animate-fade-in prose prose-sm prose-p:font-light prose-p:tracking-[0.01em] prose-headings:tracking-[0.005em] prose-prosetheme prose-headings:text-lg prose-headings:font-semibold prose-strong:font-medium prose-th:font-m min-w-full", className)}>
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
  const [stableBlocks, setStableBlocks] = useState(threadItem.content);
  const setCurrentSources = useChatStore(state => state.setCurrentSources);
  useEffect(() => {
    const nonStepBlocks = threadItem.content.filter(block => !block?.isStep);
    // Only update if there are actual changes to avoid unnecessary re-renders
    if (JSON.stringify(stableBlocks) !== JSON.stringify(nonStepBlocks)) {
      setStableBlocks(nonStepBlocks);
    }
  }, [threadItem.content]);

  useEffect(() => {
    setCurrentSources(threadItem.metadata?.searchResults?.map((result: any) => result.link) || []);
  }, [threadItem]);

  const steps = threadItem.content.filter(block => !!block.isStep);

  return (
    <>
      {threadItem.role === 'user' && (
        <div className="flex w-full flex-row justify-start py-8">
          <div className="text-foreground rounded-xl text-xl font-normal">
            {threadItem.content[0].content}
          </div>
        </div>
      )}

      {threadItem.role === 'assistant' && (
        <div className="flex w-full flex-col gap-4">

          <Steps steps={steps} />

          {stableBlocks?.length > 0 && <div className='flex flex-row items-center gap-1'>
            <IconBook size={16} strokeWidth={2} className="text-brand" />
            <p className='text-sm text-muted-foreground'>Answer</p>
          </div>}
          {stableBlocks?.map((block, index) => (
            <CitationProvider block={block}>

              <AIThreadItemV2 content={block.content} key={block.id} />
            </CitationProvider>
          ))}
        </div>
      )}
    </>
  );
};

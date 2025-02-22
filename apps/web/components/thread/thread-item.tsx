  import { mdxComponents } from '@/libs/mdx/mdx-components';
import { sanitizeMDX } from '@/libs/mdx/mdx-sanitization';
import { parseSourceTagsFromXML } from '@/libs/mdx/sources';
import { MdxChunk, useMdxChunker } from '@/libs/mdx/use-mdx-chunks';
import { Block, ThreadItem as ThreadItemType } from '@/libs/store/chat.store';
import { ToolCallResultType, ToolCallType } from '@repo/ai';
import { Badge, Button, Flex } from '@repo/ui';
import { IconCircleCheckFilled, IconCircleDashed, IconCircleDashedX } from '@tabler/icons-react';
import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote/rsc';
import { serialize } from 'next-mdx-remote/serialize';
import { Fragment, memo, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SourcesStack } from '../sources-stack';
import { SearchResults } from '../tools/search-results';
import { VaulDrawer } from './vaul-drawer';


  type NestedMDXRemoteSerializeResult =
    | MDXRemoteSerializeResult
    | {
      source: string;
      tag: string;
      tagProps: Record<string, string>;
      children: NestedMDXRemoteSerializeResult[];
    };

  export const AIThreadItem = ({ content }: { content: string }) => {
    const animatedText = content ?? "";
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

          setCachedChunks((prev) => new Map(prev).set(chunkSource, mdx));
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
      <div className="animate-fade-in prose prose-sm min-w-full">
        {mdxSources.map((source, index) => (
          <Fragment key={index}>{renderMdxSource(source)}</Fragment>
        ))}
        <div className="flex flex-col items-start justify-start">
          <SourcesStack urls={sources} />
        </div>
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

    const steps = threadItem.content.filter(block => block.isStep);
    const contentBlocks = threadItem.content.filter(block => !block?.isStep);


    return (
      <>
        {threadItem.role === 'user' && (
          <div className="flex w-full flex-row justify-start py-2">
            <div className="rounded-xl bg-zinc-100 px-3 py-2.5 text-sm font-medium tracking-tight text-zinc-900">
              {threadItem.content[0].content}
            </div>
          </div>
        )}

        {threadItem.role === 'assistant' && (
          <div className="flex w-full flex-col gap-4">
            <Steps steps={steps} />
            {contentBlocks?.map((block, index) => (
              <AIThreadItem content={block.content} key={block.id} />
            ))}
          </div>
        )}
      </>
    );
  };


  export const ThreadItemBlock = ({ block }: { block: Block }) => {

    return (


      <div className="flex w-full flex-col gap-2">
        <SearchAndReadingResults toolCalls={block.toolCalls || []} toolCallResults={block.toolCallResults || []} />
      </div>

    );
  };

  export const getSearchToolMeta = (input: ToolCallType, output: ToolCallResultType): { snippet: string, link: string, title: string }[] => {
    return output.result?.map((result: any) => ({
      snippet: result.snippet,
      link: result.link,
      title: result.title,
    }));
  };

  export const getReaderToolMeta = (input: ToolCallType, output: ToolCallResultType): { url: string } => {
    return {
      url: input.args.url as string,
    };
  };


  export type SearchAndReadingResultsProps = {
    toolCalls: ToolCallType[];
    toolCallResults: ToolCallResultType[];
  }


  export const SearchAndReadingResults = ({ toolCalls, toolCallResults }: SearchAndReadingResultsProps) => {
    const toolCallsWithResults = useMemo(() => {
      if (!toolCalls?.length) return [];

      return toolCalls.map(call => ({
        ...call,
        output: toolCallResults?.find(result => result?.toolCallId === call.toolCallId) ?? null
      }));
    }, [toolCalls, toolCallResults]);

    const searchToolResults = useMemo(() => {
      return toolCallsWithResults.filter(call => call?.toolName === 'search');
    }, [toolCallsWithResults]);

    const searchResults = useMemo(() => {
      if (!searchToolResults?.length) return [];

      return searchToolResults.flatMap(result => {
        const outputResults = result?.output?.result;
        if (!Array.isArray(outputResults)) return [];

        return outputResults.map((item: any) => ({
          snippet: item?.snippet ?? '',
          link: item?.link ?? '',
          title: item?.title ?? '',
        }));
      }).filter(result => result.link);
    }, [searchToolResults]);

    const readingToolResults = useMemo(() => {
      return toolCallsWithResults.filter(call => call?.toolName === 'reader');
    }, [toolCallsWithResults]);

    const readingResults = useMemo(() => {
      if (!readingToolResults?.length) return [];

      return readingToolResults
        .flatMap(result => result?.args?.urls)
        .filter((url): url is string => typeof url === 'string');
    }, [readingToolResults]);

    const readResults = useMemo(() => {
      if (!searchResults?.length || !readingResults?.length) return [];

      return searchResults.filter(result =>
        result.link && readingResults.includes(result.link)
      );
    }, [searchResults, readingResults]);

    if (!searchToolResults?.length && !readingToolResults?.length) {
      return null;
    }

    return (
      <Flex direction="col" gap="md" className="w-full">
        <p className="text-xs text-zinc-500">Search Queries</p>
        <div className='flex flex-row gap-2 flex-wrap'>
          {/* {JSON.stringify(searchToolResults)} */}
          {searchToolResults?.map((result, index) => (
            (result.args.queries as string[] ?? []).map((query, index)=>
            <Badge key={index} variant="default">{query}</Badge>)
          ))}
        </div>
        {/* <SearchResults searchResults={searchResults} /> */}
        {/* {searchToolResults[0]?.args?.reasoning ? <p className="text-xs text-zinc-500">tool Reasoning: {searchToolResults[0]?.args?.reasoning as string}</p> : null} */}
        {searchResults?.length > 0 ? <>
          <p className="text-xs text-zinc-500">READING SOURCES</p>
          <SearchResults searchResults={searchResults} />
        </> : null}
      </Flex>
    );
  };

  export const ThreadBlockMetadata = ({ block }: { block: Block }) => {
    const copyToClipboard = (element: HTMLElement | null) => {
      if (!element) return;
      
      const text = element.innerText;
      navigator.clipboard.writeText(text).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      });
    };

    return (
      <div className="flex w-full flex-col gap-4">
        {Object.entries(block).map(([key, value]) => (
          <div className="flex flex-col gap-2" key={key}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-800">{key}</p>
              <Button
                variant="ghost"
                size="xs"
                onClick={(e) => {
                  const contentElement = e.currentTarget.parentElement?.nextElementSibling;
                  copyToClipboard(contentElement as HTMLElement);
                }}
              >
                Copy
              </Button>
            </div>
            {["toolCalls", "toolCallResults"].includes(key) ? (
              <p className="text-xs text-zinc-500 prose prose-sm">
                <pre>{JSON.stringify(value, null, 2)}</pre>
              </p>
            ) : (
              <p className="text-xs text-zinc-500 prose prose-sm">
                <ReactMarkdown>{value?.toString()}</ReactMarkdown>
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };


  export const StepStatus = ({ status }: { status: Block['nodeStatus'] }) => {
    switch (status) {
      case 'pending':
        return <SpinnerIcon size={16} className='size-4 animate-spin shrink-0 text-zinc-500'/>;
      case 'completed':
        return <IconCircleCheckFilled className="size-4 shrink-0 text-zinc-800"/>;
      case 'error':
        return <IconCircleDashedX className="size-4 shrink-0 text-zinc-500"/>;
      default:
        return <IconCircleDashed className="size-4 shrink-0 text-zinc-200" strokeWidth={1} />;
    }
  };

  export const SpinnerIcon = ({ size = 24, ...props }: {
    size?: number;
    className?: string;
  }) => {
    return <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 44 44"
        stroke="currentColor"
        {...props}
      >
        <title>Loading...</title>
        <g fill="none" fillRule="evenodd" strokeWidth="2">
          <circle cx="22" cy="22" r="2" strokeWidth={2}>
            <animate
              attributeName="r"
              begin="0s"
              dur="1.8s"
              values="1; 20"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.165, 0.84, 0.44, 1"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              begin="0s"
              dur="1.8s"
              values="1; 0"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.3, 0.61, 0.355, 1"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="22" cy="22" r="2" strokeWidth={2}>
            <animate
              attributeName="r"
              begin="-0.9s"
              dur="1.8s"
              values="1; 20"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.165, 0.84, 0.44, 1"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              begin="-0.9s"
              dur="1.8s"
              values="1; 0"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.3, 0.61, 0.355, 1"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </svg>
  };

  export const Steps = ({steps}: {steps: Block[]}) => {
    return (
      <div className="flex w-full flex-col border rounded-xl pl-4 pr-8 py-8">


            {(steps || []).map((block, index, array) => (

  <div className="flex flex-row gap-2 items-stretch justify-start">
    <div className="flex flex-col items-center justify-start min-h-full px-2">
      <div className='bg-white z-10'>
        <StepStatus status={block.nodeStatus} />
      </div>
      <div className="min-h-full flex-1 w-[1px] bg-zinc-100"/>

    </div>
              <div className={"flex flex-col pb-4"} key={index}>

                <Fragment key={index}>
                  {/* <p className="text-xs text-zinc-500 flex flex-row items-center gap-2 mb-2">{block.nodeStatus === "pending" ? <Loader className="animate-spin size-4" /> : null} {block.nodeKey}</p> */}
                  {block.nodeReasoning ? <p className="text-sm"> {block.nodeReasoning}</p> : null}
                  <ThreadItemBlock block={block} />
                  <div className="flex flex-row gap-2">
                  <VaulDrawer renderContent={() => (<AIThreadItem content={block.content} key={index} />
                  )}>
                    <Button variant="default" size="xs">Read more</Button>
                  </VaulDrawer>
                  <VaulDrawer renderContent={() => (<ThreadBlockMetadata block={block} />
                  )}>
                    <Button variant="outlined" size="xs">More details</Button>
                  </VaulDrawer>
                  </div>
                </Fragment>
              </div>
              </div>
            ))}
          </div>
    );
  };


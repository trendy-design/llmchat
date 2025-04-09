import {
    ErrorBoundary,
    ErrorPlaceholder,
    mdxComponents,
    useMdxChunker,
} from '@repo/common/components';
import { cn } from '@repo/ui';
import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote/rsc';
import { serialize } from 'next-mdx-remote/serialize';
import { memo, Suspense, useEffect, useState } from 'react';
import remarkGfm from 'remark-gfm';

export const markdownStyles = {
    'animate-fade-in prose prose-sm min-w-full': true,

    // Text styles
    'prose-p:font-normal prose-p:text-base prose-p:leading-[1.65rem]': true,
    'prose-headings:text-base prose-headings:font-medium ': true,
    'prose-h1:text-2xl prose-h1:font-medium ': true,
    'prose-h2:text-2xl prose-h2:font-medium ': true,
    'prose-h3:text-lg prose-h3:font-medium ': true,
    'prose-strong:font-medium prose-th:font-medium': true,

    'prose-li:text-muted-foreground prose-li:font-normal prose-li:leading-[1.65rem]': true,

    // Code styles
    'prose-code:font-mono prose-code:text-sm prose-code:font-normal': true,
    'prose-code:bg-secondary prose-code:border-border prose-code:border prose-code:rounded-lg prose-code:p-0.5':
        true,

    // Table styles
    'prose-table:border-border prose-table:border prose-table:rounded-lg prose-table:bg-background':
        true,

    // Table header
    'prose-th:text-sm prose-th:font-medium prose-th:text-muted-foreground prose-th:bg-tertiary prose-th:px-3 prose-th:py-1.5':
        true,

    // Table row
    'prose-tr:border-border prose-tr:border': true,

    // Table cell
    'prose-td:px-3 prose-td:py-2.5': true,

    // Theme
    'prose-prosetheme': true,
};

type MarkdownContentProps = {
    content: string;
    className?: string;
    shouldAnimate?: boolean;
    isCompleted?: boolean;
    isLast?: boolean;
};

type NestedChunk = {
    id: string;
    content: string;
    children: NestedChunk[];
};

export const removeIncompleteTags = (content: string) => {
    // A simpler approach that handles most cases:
    // 1. If the last < doesn't have a matching >, remove from that point onward
    const lastLessThan = content.lastIndexOf('<');
    if (lastLessThan !== -1) {
        const textAfterLastLessThan = content.substring(lastLessThan);
        if (!textAfterLastLessThan.includes('>')) {
            return content.substring(0, lastLessThan);
        }
    }

    return content;
};

// New function to normalize content before serialization
export const normalizeContent = (content: string) => {
    // Replace literal "\n" strings with actual newlines
    // This handles cases where newlines are escaped in the string
    return content.replace(/\\n/g, '\n');
};

function parseCitationsWithSourceTags(markdown: string): string {
    // Basic single citation regex
    const citationRegex = /\[(\d+)\]/g;
    let result = markdown;

    // Replace each citation with the wrapped version
    result = result.replace(citationRegex, (match, p1) => {
        return `<Source>${p1}</Source>`;
    });

    // This regex and replacement logic needs to be fixed
    const multipleCitationsRegex = /\[(\d+(?:,\s*\d+)+)\]/g;
    result = result.replace(multipleCitationsRegex, match => {
        // Extract all numbers from the citation
        const numbers = match.match(/\d+/g) || [];
        // Create Source tags for each number
        return numbers.map(num => `<Source>${num}</Source>`).join(' ');
    });

    return result;
}

export const MarkdownContent = memo(
    ({ content, className, isCompleted, isLast }: MarkdownContentProps) => {
        const [previousContent, setPreviousContent] = useState<string[]>([]);
        const [currentContent, setCurrentContent] = useState<string>('');
        const { chunkMdx } = useMdxChunker();

        useEffect(() => {
            if (!content) return;

            (async () => {
                try {
                    const normalizedContent = normalizeContent(content);
                    const contentWithCitations = parseCitationsWithSourceTags(normalizedContent);

                    if (isCompleted) {
                        setPreviousContent([]);
                        setCurrentContent(contentWithCitations);
                    } else {
                        const { chunks } = await chunkMdx(contentWithCitations);

                        if (chunks.length > 0) {
                            if (chunks.length > 1) {
                                setPreviousContent(chunks.slice(0, -1));
                            } else {
                                setPreviousContent([]);
                            }
                            setCurrentContent(chunks[chunks.length - 1] || '');
                        }
                    }
                } catch (error) {
                    console.error('Error processing MDX chunks:', error);
                }
            })();
        }, [content, isCompleted]);

        if (isCompleted && !isLast) {
            return (
                <div className={cn('', markdownStyles, className)}>
                    <ErrorBoundary fallback={<ErrorPlaceholder />}>
                        <MemoizedMdxChunk chunk={currentContent} />
                    </ErrorBoundary>
                </div>
            );
        }

        return (
            <div className={cn('', markdownStyles, className)}>
                {previousContent.length > 0 &&
                    previousContent.map((chunk, index) => (
                        <ErrorBoundary fallback={<ErrorPlaceholder />} key={`prev-${index}`}>
                            <MemoizedMdxChunk chunk={chunk} />
                        </ErrorBoundary>
                    ))}
                {currentContent && (
                    <ErrorBoundary fallback={<ErrorPlaceholder />} key="current-chunk">
                        <MemoizedMdxChunk chunk={currentContent} />
                    </ErrorBoundary>
                )}
            </div>
        );
    }
);

MarkdownContent.displayName = 'MarkdownContent';

export const MemoizedMdxChunk = memo(({ chunk }: { chunk: string }) => {
    const [mdx, setMdx] = useState<MDXRemoteSerializeResult | null>(null);

    useEffect(() => {
        if (!chunk) return;

        let isMounted = true;

        (async () => {
            try {
                const serialized = await serialize(chunk, {
                    mdxOptions: {
                        remarkPlugins: [remarkGfm],
                        // rehypePlugins: [rehypeSanitize],
                    },
                });

                if (isMounted) {
                    setMdx(serialized);
                }
            } catch (error) {
                console.error('Error serializing MDX chunk:', error);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [chunk]);

    if (!mdx) {
        return null;
    }

    return (
        <ErrorBoundary fallback={<ErrorPlaceholder />}>
            <Suspense fallback={<div>Loading...</div>}>
                <MDXRemote {...mdx} components={mdxComponents} />
            </Suspense>
        </ErrorBoundary>
    );
});

MemoizedMdxChunk.displayName = 'MemoizedMdxChunk';

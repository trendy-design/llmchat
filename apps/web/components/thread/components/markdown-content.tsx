import { mdxComponents } from '@/libs/mdx/mdx-components';
import { useMdxChunker } from '@/libs/mdx/use-mdx-chunks';
import { cn } from '@repo/ui';
import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote/rsc';
import { serialize } from 'next-mdx-remote/serialize';
import { memo, useEffect, useState } from 'react';
import remarkGfm from 'remark-gfm';

type MarkdownContentProps = {
    content: string;
    className?: string;
    shouldAnimate?: boolean;
};

type NestedChunk = {
    id: string;
    content: string;
    children: NestedChunk[];
};

const markdownStyles = {
    'animate-fade-in prose prose-sm min-w-full': true,

    // Text styles
    'prose-p:font-light prose-p:tracking-[0.01em]': true,
    'prose-headings:text-base prose-headings:font-medium prose-headings:tracking-[0.005em]': true,
    'prose-strong:font-medium prose-th:font-medium': true,

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

export const MarkdownContent = memo(({ content, className }: MarkdownContentProps) => {
    const [previousContent, setPreviousContent] = useState<string[]>([]);
    const [currentContent, setCurrentContent] = useState<string>('');
    const { chunkMdx } = useMdxChunker();

    useEffect(() => {
        if (!content) return;

        (async () => {
            try {
                const normalizedContent = normalizeContent(content);
                const cleanedContent = removeIncompleteTags(normalizedContent);
                const { chunks } = await chunkMdx(cleanedContent);
                console.log(chunks);

                if (chunks.length > 0) {
                    // Everything except the last chunk becomes previous content
                    if (chunks.length > 1) {
                        setPreviousContent(chunks.slice(0, -1));
                    }
                    // Last chunk is current content
                    setCurrentContent(chunks[chunks.length - 1] || '');
                }
            } catch (error) {
                console.error('Error processing MDX chunks:', error);
            }
        })();
    }, [content]);

    if (!previousContent && !currentContent) {
        return null;
    }

    return (
        <div className={cn('', markdownStyles, className)}>
            {previousContent.map(chunk => (
                <MemoizedMdxChunk key={chunk} chunk={chunk} />
            ))}
            {currentContent && <MemoizedMdxChunk chunk={currentContent} />}
        </div>
    );
});

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
        <span className="inline-block">
            <MDXRemote {...mdx} components={mdxComponents} />
        </span>
    );
});

MemoizedMdxChunk.displayName = 'MemoizedMdxChunk';

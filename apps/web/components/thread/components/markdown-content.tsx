import { mdxComponents } from '@/libs/mdx/mdx-components';
import { cn } from '@repo/ui';
import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote/rsc';
import { serialize } from 'next-mdx-remote/serialize';
import { memo, useEffect, useState } from 'react';
import remarkGfm from 'remark-gfm';

type MarkdownContentProps = {
    content: string;
    className?: string;
};

export const MarkdownContent = memo(({ content, className }: MarkdownContentProps) => {
    const animatedText = content ?? '';
    const [serializedMdx, setSerializedMdx] = useState<MDXRemoteSerializeResult | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const mdx = await serialize(animatedText, {
                    mdxOptions: { remarkPlugins: [remarkGfm] },
                });
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
        <div
            className={cn(
                'animate-fade-in prose prose-sm prose-p:font-light prose-p:tracking-[0.01em] prose-headings:tracking-[0.005em] prose-prosetheme prose-headings:text-base prose-headings:font-medium prose-strong:font-medium prose-th:font-medium prose-code:font-mono prose-code:text-sm prose-code:font-normal prose-code:bg-secondary prose-code:border-border prose-code:border prose-code:rounded-lg prose-code:p-0.5 min-w-full',
                className
            )}
        >
            <MDXRemote {...serializedMdx} components={mdxComponents} />
        </div>
    );
});

MarkdownContent.displayName = 'MarkdownContent';

export const MemoizedMdxChunk = memo(({ source }: { source: MDXRemoteSerializeResult }) => {
    if (!source) {
        return null;
    }
    return <MDXRemote {...source} components={mdxComponents} />;
});

MemoizedMdxChunk.displayName = 'MemoizedMdxChunk';

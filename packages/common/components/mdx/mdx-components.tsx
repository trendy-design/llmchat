import { CitationProviderContext, CodeBlock, LinkPreviewPopover } from '@repo/common/components';
import { isValidUrl } from '@repo/shared/utils';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ComponentProps, ReactElement, useContext } from 'react';

export const mdxComponents: ComponentProps<typeof MDXRemote>['components'] = {
    Source: ({ children }) => {
        const { getSourceByIndex } = useContext(CitationProviderContext);
        const index = children as string;

        const source = getSourceByIndex(parseInt(index));

        const url = source?.link;

        if (!url) {
            return null;
        }

        const isValid = isValidUrl(url);

        if (!isValid) {
            return null;
        }

        return (
            <LinkPreviewPopover source={source}>
                <div className="bg-quaternary text-quaternary-foreground/70 group mx-0.5 inline-flex size-4 flex-row items-center justify-center gap-1 rounded-sm text-[10px] font-medium hover:bg-blue-600 hover:text-white">
                    {source?.index}
                </div>
            </LinkPreviewPopover>
        );
    },
    p: ({ children }) => {
        return <p>{children}</p>;
    },
    li: ({ children }) => {
        return <li>{children}</li>;
    },

    pre: ({ children }) => {
        if (typeof children === 'string') {
            return <CodeBlock code={children.replace(/<FadeEffect \/>$/, '')} />;
        }
        const codeElement = children as ReactElement;
        const className = codeElement?.props?.className || '';
        const lang = className.replace('language-', '');
        const code = codeElement?.props?.children;

        return <CodeBlock code={String(code).replace(/<FadeEffect \/>$/, '')} lang={lang} />;
    },
    code: ({ children, className }) => {
        if (!className) {
            return (
                <code className="rounded-sm !border-none !bg-blue-500/20 px-1 py-0.5 font-mono text-sm text-blue-600 outline-1 outline-blue-500/50">
                    {children}
                </code>
            );
        }
        const lang = className.replace('language-', '');
        return <CodeBlock code={String(children).replace(/<FadeEffect \/>$/, '')} lang={lang} />;
    },
};

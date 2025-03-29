import { CodeBlock } from '#components/code-block/code-block';
import { LinkPreviewPopover } from '#components/link-preview';
import { CitationProviderContext } from '#components/thread/citation-provider';
import { isValidUrl } from '@repo/shared/utils';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ComponentProps, ReactElement, useContext } from 'react';

// Simple CSS animation classes that only animate once on mount
// Add these to your global CSS or a stylesheet
// .fade-in-once {
//   animation: fadeInOnce 0.5s ease forwards;
// }
// @keyframes fadeInOnce {
//   from { opacity: 0; transform: translateY(5px); }
//   to { opacity: 1; transform: translateY(0); }
// }

export const mdxComponents: ComponentProps<typeof MDXRemote>['components'] = {
    Source: ({ children }) => {
        const { citations } = useContext(CitationProviderContext);
        const url = children?.props?.children as string;

        const isValid = isValidUrl(url);
        if (!isValid) {
            return null;
        }
        const citation = citations[url];
        if (!citation) {
            return null;
        }
        return (
            <LinkPreviewPopover url={url}>
                <div className="group inline-flex size-4 flex-row items-center justify-center gap-1 rounded-sm border-yellow-700/20 !bg-yellow-700/20 text-[10px] text-yellow-900">
                    {citation?.index}
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
                <code className="rounded-md border border-yellow-700/20 !bg-yellow-700/10 px-1.5 py-0.5 font-mono text-sm text-yellow-700">
                    {children}
                </code>
            );
        }
        const lang = className.replace('language-', '');
        return <CodeBlock code={String(children).replace(/<FadeEffect \/>$/, '')} lang={lang} />;
    },
};

import { CodeBlock } from '@/components/code-block/code-block';
import { LinkPreviewPopover } from '@/components/link-preview';
import { CitationProviderContext } from '@/components/thread/citation-provider';
import { isValidUrl } from '@repo/shared/utils';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ComponentProps, ReactElement, useContext } from 'react';

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
        <div className="bg-brand/20 text-brand group inline-flex size-4 flex-row items-center justify-center gap-1 rounded-sm text-[10px]">
          {citation?.index}
        </div>
      </LinkPreviewPopover>
    );
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
        <code className="border-border bg-secondary text-foreground rounded border px-1.5 py-0.5 font-mono text-sm">
          {children}
        </code>
      );
    }
    const lang = className.replace('language-', '');
    return <CodeBlock code={String(children).replace(/<FadeEffect \/>$/, '')} lang={lang} />;
  },
};

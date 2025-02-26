import { CodeBlock } from '@/components/code-block/code-block';
import React, { ReactElement, useContext } from 'react';

import { Reasoning } from '@/components/reasoning-steps/reasoning';
import { CitationProviderContext } from '@/components/thread/citation-provider';
import { isValidUrl } from '@repo/shared/utils';
import { AnimatePresence } from 'framer-motion';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ComponentProps } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';

export const mdxComponents: ComponentProps<typeof MDXRemote>['components'] = {
  Think: ({ children, isTagComplete }) => {
    const childs = React.Children.toArray(children).filter(Boolean);
    const { scrollRef, contentRef } = useStickToBottom();

    return (
      <>
        {/* <Accordion type="single" collapsible>
          <AccordionItem value="1" className="border-none">
            <div className={`sticky top-0 z-10 bg-white pt-4`}>
              <AccordionTrigger
                className={`z-6 group rounded-xl rounded-b-none border border-x border-t border-b-transparent bg-white p-3 px-3 !pb-0 pt-3 text-sm font-medium text-stone-900 transition-all duration-[5000ms] ease-in-out [&[data-state=open]]:border-b-stone-200 [&[data-state=open]]:!pb-3`}
              >
                Some Thought
              </AccordionTrigger>
            </div>
            <AccordionContent
              className={cn("overflow-hidden border-x bg-white")}
            > */}
        <div ref={scrollRef} className="group-data-[state=open]:rounded-b-xl">
          <div ref={contentRef} className="flex min-h-full flex-col items-start justify-start">
            <AnimatePresence mode="wait">
              {childs.map((child, index) => (
                <Reasoning
                  key={index}
                  isComplete={index !== childs.length - 1}
                  isLast={index === childs.length - 1}
                  index={index}
                  isFirst={index === 0}
                >
                  {child}
                </Reasoning>
              ))}
            </AnimatePresence>
          </div>
        </div>
        {/* </AccordionContent>
            <div className="sticky top-0 z-20 bg-white">
              <div className="h-[12px] w-full rounded-b-xl border-x border-b" />
            </div>
          </AccordionItem>
        </Accordion> */}
      </>
    );
  },
  Source: ({ children }) => {
    const { citations } = useContext(CitationProviderContext);
    const url = children?.props?.children as string;

    const isValid = isValidUrl(url);
    if (!isValid) {
      return null;
    }
    const citation = citations[url];
    return (
      <div className="bg-brand/10 text-brand group inline-flex size-4 flex-row items-center justify-center gap-1 rounded-md text-[10px]">
        {citation?.index}
      </div>
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

import { CodeBlock } from '@/components/code-block/code-block';
import React, { ReactElement } from 'react';

import { Reasoning } from '@/components/reasoning-steps/reasoning';
import { AnimatePresence } from 'framer-motion';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ComponentProps } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (error) { 
    return false;
  }
};

const getHost = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch (error) {
    return null;
  }
};

const getFavIcon = (host?: string) => {
  if (!host) {
    return null;
  }
  try {
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  } catch (error) {
    return null;
  }
};

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
                className={`z-6 group rounded-xl rounded-b-none border border-x border-t border-b-transparent bg-white p-3 px-3 !pb-0 pt-3 text-sm font-medium text-zinc-900 transition-all duration-[5000ms] ease-in-out [&[data-state=open]]:border-b-zinc-200 [&[data-state=open]]:!pb-3`}
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
    const url = children?.props?.children as string;
    //check valid url

    const host = getHost(url);
    const favIcon = getFavIcon(url ??"");
  
    console.log("sourceii",url, host, favIcon)
    if (isValidUrl(url)) {
    
    return <div className="inline-flex group bg-white border rounded-full p-0.5 text-xs items-center flex-row gap-1 text-zinc-500">
        {favIcon && <img src={favIcon} className="size-3 rounded-full object-cover !my-0" />}
        <span className="group-hover:flex hidden transition-all duration-300 pr-1">{host}</span>
      </div>
    }


    return <></>

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
        <code className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800">
          {children}
        </code>
      );
    }
    const lang = className.replace('language-', '');
    return <CodeBlock code={String(children).replace(/<FadeEffect \/>$/, '')} lang={lang} />;
  },
};

import { motion } from "framer-motion";
import Markdown from "marked-react";

import { CodeBlock } from "@/components/codeblock";
import { LinkBlock } from "@/components/ui/link-block";

const VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1, ease: "easeInOut", delay: 0.1 },
  },
};

export const useMarkdown = () => {
  const renderMarkdown = (message: string, animate: boolean) => (
    <Markdown
      renderer={{
        text: (children) => (
          <motion.span
            variants={VARIANTS}
            className="dark:text-zinc-100 text-zinc-700 tracking-[0.01em]"
            animate={"visible"}
            initial={animate ? "hidden" : "visible"}
          >
            {children}
          </motion.span>
        ),
        paragraph: (children) => (
          <p className="text-sm leading-7">{children}</p>
        ),
        heading: (children, level) => {
          const Heading = `h${level}` as keyof JSX.IntrinsicElements;
          return <Heading className="font-medium text-md">{children}</Heading>;
        },
        link: (href) => <LinkBlock url={href} />,
        blockquote: (children) => (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic">
            <p className="text-sm leading-7 ">{children}</p>
          </blockquote>
        ),
        list: (children, ordered) =>
          ordered ? (
            <ol className="list-decimal ml-8">{children}</ol>
          ) : (
            <ul className="list-disc ml-8">{children}</ul>
          ),
        listItem: (children) => (
          <li className="my-4">
            <p className="text-sm leading-7 ">{children}</p>
          </li>
        ),
        strong: (children) => (
          <strong className="font-semibold">{children}</strong>
        ),
        code: (code, lang) => (
          <div className="my-4 w-full flex-shrink-0">
            <CodeBlock lang={lang} code={code?.toString()} />
          </div>
        ),
        codespan: (code) => (
          <span className="px-2 py-1 text-xs rounded-md dark:text-white bg-zinc-50 text-zinc-800 dark:bg-white/10 font-medium">
            {code}
          </span>
        ),
      }}
    >
      {message}
    </Markdown>
  );

  return { renderMarkdown };
};

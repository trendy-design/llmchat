import { CodeBlock } from "@/components/codeblock";
import { motion } from "framer-motion";
import Markdown from "marked-react";

const variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1, ease: "easeInOut", delay: 0.1 },
  },
};

export const useMarkdown = () => {
  const renderMarkdown = (message: string, animate: boolean) => {
    return (
      <Markdown
        renderer={{
          text: (children) => (
            <motion.span
              variants={variants}
              className="dark:text-zinc-100 text-zinc-700"
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
            return <h1 className="font-medium text-md">{children}</h1>;
          },
          link: (href, text) => {
            return (
              <a href={href} target="_blank">
                {text}
              </a>
            );
          },
          blockquote: (children) => (
            <div>
              <p className="text-sm leading-7 ">{children}</p>
            </div>
          ),
          list: (children, ordered) => {
            if (ordered) {
              return <ol className="list-decimal ml-8">{children}</ol>;
            }
            return <ul className="list-disc ml-8">{children}</ul>;
          },
          listItem: (children) => (
            <li className="my-4">
              <p className="text-sm leading-7 ">{children}</p>
            </li>
          ),
          strong: (children) => (
            <strong className="font-semibold">{children}</strong>
          ),
          code: (code, lang) => {
            return (
              <div className="my-4 w-full flex-shrink-0">
                <CodeBlock lang={lang} code={code?.toString()} />
              </div>
            );
          },
          codespan(code, lang) {
            return (
              <span className="px-2 py-1 text-xs rounded-md  dark:text-[#41db8f] bg-zinc-200 text-zinc-600 dark:bg-[#41db8f]/20 font-semibold">
                {code}
              </span>
            );
          },
        }}
      >
        {message}
      </Markdown>
    );
  };
  return { renderMarkdown };
};

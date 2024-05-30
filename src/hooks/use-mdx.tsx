import { motion } from "framer-motion";
import Markdown from "marked-react";

import { CodeBlock } from "@/components/codeblock";
import { cn } from "@/lib/utils";

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
          <p className="text-sm md:text-base leading-7">{children}</p>
        ),
        heading: (children, level) => {
          const Heading = `h${level}` as keyof JSX.IntrinsicElements;
          return (
            <Heading
              className={cn(
                "font-medium",
                level < 4 ? "py-2 text-lg" : "py-1 text-md"
              )}
            >
              {children}
            </Heading>
          );
        },
        link: (href, text) => {
          if (text && href) {
            return (
              <a
                href={href}
                className="underline underline-offset-4 decoration-blue-300 px-1 py-1 hover:bg-blue-400/30 rounded-md dark:bg-white/10"
              >
                {text}
              </a>
            );
          }
          return <></>;
        },
        blockquote: (children) => (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic">
            <p className="text-sm md:text-base leading-7 ">{children}</p>
          </blockquote>
        ),
        list: (children, ordered) =>
          ordered ? (
            <ol className="list-decimal ml-4">{children}</ol>
          ) : (
            <ul className="list-disc ml-4">{children}</ul>
          ),
        listItem: (children) => (
          <li className="my-4">
            <p className="text-sm md:text-base leading-7 ">{children}</p>
          </li>
        ),
        strong: (children) => (
          <strong className="font-medium">{children}</strong>
        ),
        code: (code, lang) => (
          <div className="my-4 w-full flex-shrink-0">
            <CodeBlock lang={lang} code={code?.toString()} />
          </div>
        ),
        codespan: (code) => (
          <span className="px-2 py-1 text-sm md:text-base rounded-md dark:text-white bg-zinc-50 text-zinc-800 dark:bg-white/10 font-medium">
            {code}
          </span>
        ),
        br: () => <br />,
        table: (children) => (
          <div className="overflow-x-auto my-3 border border-zinc-100 rounded-xl dark:border-white/10 ">
            <table className="w-full  overflow-hidden text-sm md:text-base text-left rtl:text-right text-gray-600 dark:text-gray-200">
              {children}
            </table>
          </div>
        ),
        tableHeader(children) {
          return (
            <thead className="text-sm md:text-base w-full font-medium text-zinc-800 uppercase bg-zinc-50 dark:bg-white/10 dark:text-white/20">
              {children}
            </thead>
          );
        },

        tableRow(children) {
          return (
            <tr className="hover:bg-zinc-50 dark:bg-white/5">{children}</tr>
          );
        },
        tableCell(children, flags) {
          if (flags.header) {
            return <th className="p-3 text-xs md:text-sm">{children}</th>;
          }
          return <td className="p-3 text-sm md:text-base">{children}</td>;
        },
        tableBody: (children) => <tbody>{children}</tbody>,
      }}
    >
      {message}
    </Markdown>
  );

  return { renderMarkdown };
};

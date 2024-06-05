import { motion } from "framer-motion";
import Markdown from "marked-react";

import { CodeBlock } from "@/components/codeblock";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Link } from "@phosphor-icons/react";
import { ReactNode, useState } from "react";

export const REVEAL_ANIMATION_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1, ease: "easeInOut", delay: 0.1 },
  },
};

export type TLink = {
  href: string;
  text: ReactNode;
};
export const useMarkdown = () => {
  const [links, setLinks] = useState<TLink[]>([]);

  const renderMarkdown = (
    message: string,
    animate: boolean,
    messageId: string
  ) => (
    <Markdown
      renderer={{
        text: (children) => (
          <motion.span
            variants={REVEAL_ANIMATION_VARIANTS}
            animate={"visible"}
            initial={animate ? "hidden" : "visible"}
          >
            {children}
          </motion.span>
        ),
        paragraph: (children) => (
          <p className="text-xs md:text-sm leading-relaxed dark:text-zinc-100 text-zinc-700">
            {children}
          </p>
        ),
        em: (children) => (
          <em className="italic text-xs md:text-sm opacity-50">{children}</em>
        ),
        heading: (children, level) => {
          const Heading = `h${level}` as keyof JSX.IntrinsicElements;
          return (
            <Heading
              className={cn("font-medium", level < 4 ? "text-md" : "text-base")}
            >
              {children}
            </Heading>
          );
        },
        hr: () => <hr className="my-4 border-gray-100 dark:border-white/10" />,
        link: (href, text) => {
          if (text && href) {
            return (
              <HoverCard>
                <HoverCardTrigger>
                  <a
                    href={href}
                    data-message-id={messageId}
                    className="underline underline-offset-4 decoration-blue-400/10 hover:decoration-blue-400 text-blue-500 dark:text-blue-300 px-1 py-1 hover:bg-blue-400/10 rounded-md"
                  >
                    {text}
                  </a>
                </HoverCardTrigger>
                <HoverCardContent
                  sideOffset={12}
                  className="p-3 rounded-xl flex max-w-[500px] flex-col items-start bg-zinc-700 hover:bg-zinc-800 cursor-pointer"
                  onClick={() => {
                    window.open(href, "_blank");
                  }}
                >
                  <p className="flex flex-row text-xs items-center gap-2 text-zinc-200 dark:text-zinc-200 leading-relaxed w-full whitespace-pre-wrap overflow-hidden">
                    <Link
                      size={16}
                      weight="bold"
                      className="text-white flex-shrink-0"
                    />
                    {href}
                    <ArrowUpRight
                      size={16}
                      weight="bold"
                      className="text-white flex-shrink-0"
                    />
                  </p>
                </HoverCardContent>
              </HoverCard>
            );
          }
          return <></>;
        },
        blockquote: (children) => (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic">
            <p className="text-xs md:text-sm leading-relaxed ">{children}</p>
          </blockquote>
        ),
        list: (children, ordered) =>
          ordered ? (
            <ol className="list-decimal text-xs md:text-sm ml-4">{children}</ol>
          ) : (
            <ul className="list-disc ml-4">{children}</ul>
          ),
        listItem: (children) => (
          <li className="my-4">
            <p className="text-xs md:text-sm leading-relaxed">{children}</p>
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
          <span className="px-2 py-1 text-xs md:text-sm rounded-md dark:text-white bg-zinc-50 text-zinc-800 dark:bg-white/10 font-medium">
            {code}
          </span>
        ),
        br: () => <br />,
        table: (children) => (
          <div className="overflow-x-auto my-3 border border-zinc-100 rounded-xl dark:border-white/10 ">
            <table className="w-full  overflow-hidden text-xs md:text-sm text-left rtl:text-right text-gray-600 dark:text-gray-200">
              {children}
            </table>
          </div>
        ),
        tableHeader(children) {
          return (
            <thead className="text-xs md:text-sm w-full font-medium text-zinc-800 uppercase bg-zinc-50 dark:bg-white/10 dark:text-white/20">
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
          return <td className="p-3 text-xs md:text-sm">{children}</td>;
        },
        tableBody: (children) => <tbody>{children}</tbody>,
      }}
    >
      {message}
    </Markdown>
  );

  return { renderMarkdown, links };
};

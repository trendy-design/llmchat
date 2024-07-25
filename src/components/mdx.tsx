import { CodeBlock } from "@/components/codeblock";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { REVEAL_ANIMATION_VARIANTS } from "@/helper/animations";
import { cn } from "@/helper/clsx";
import { ArrowUpRight, Link } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Markdown from "marked-react";
import { FC, ReactNode } from "react";

export type TMdx = {
  message?: string;
  animate: boolean;
  messageId?: string;
  size?: "sm" | "base";
};

const Mdx: FC<TMdx> = ({ message, animate, messageId, size = "base" }) => {
  if (!message || !messageId) {
    return null;
  }

  const renderParagraph = (children: ReactNode) => <p>{children}</p>;

  const renderEm = (children: ReactNode) => <em>{children}</em>;

  const renderHeading = (children: ReactNode, level: number) => {
    const Heading = `h${level}` as keyof JSX.IntrinsicElements;
    return <Heading>{children}</Heading>;
  };

  const renderHr = () => (
    <hr className="my-4 border-gray-100 dark:border-white/10" />
  );

  const renderLink = (href: string, text: ReactNode, messageId: string) => {
    if (text && href) {
      return (
        <HoverCard>
          <HoverCardTrigger>
            <a href={href} target="_blank" data-message-id={messageId}>
              {text}
            </a>
          </HoverCardTrigger>
          <HoverCardContent
            sideOffset={12}
            className="flex max-w-[500px] cursor-pointer flex-col items-start rounded-xl bg-zinc-700 p-3 hover:bg-zinc-800"
            onClick={() => {
              window.open(href, "_blank");
            }}
          >
            <p className="flex w-full flex-row items-center gap-2 overflow-hidden whitespace-pre-wrap text-xs font-normal leading-7 text-zinc-200 dark:text-zinc-200">
              <Link
                size={16}
                weight="bold"
                className="flex-shrink-0 text-white"
              />
              {href}
              <ArrowUpRight
                size={16}
                weight="bold"
                className="flex-shrink-0 text-white"
              />
            </p>
          </HoverCardContent>
        </HoverCard>
      );
    }
    return <></>;
  };

  const renderImage = (src: string, alt: string) => {
    return <></>;
  };

  const renderBlockquote = (children: ReactNode) => (
    <blockquote>
      <p>{children}</p>
    </blockquote>
  );

  const renderList = (children: ReactNode, ordered: boolean) =>
    ordered ? <ol>{children}</ol> : <ul>{children}</ul>;

  const renderListItem = (children: ReactNode) => (
    <li>
      <p>{children}</p>
    </li>
  );

  const renderStrong = (children: ReactNode) => <strong>{children}</strong>;

  const renderCode = (code: string, lang: string) => (
    <div className="not-prose my-4 w-full flex-shrink-0">
      <CodeBlock lang={lang} code={code?.toString()} />
    </div>
  );

  const renderCodespan = (code: string) => (
    <span className="rounded-md bg-zinc-50 px-2 py-1 text-sm font-medium text-zinc-800 dark:bg-white/10 dark:text-white md:text-base">
      {code}
    </span>
  );

  const articleClass = cn(
    "prose dark:prose-invert pb-8 w-full prose-zinc prose-h3:font-medium prose-h4:font-medium prose-h5:font-medium prose-h6:font-medium prose-h3:text-lg prose-h4:text-base prose-h5:text-base prose-h6:text-base prose-heading:font-medium prose-strong:font-medium prose-headings:text-lg prose-th:text-sm",
    {
      "prose-sm": size === "sm",
      "prose-base": size === "base",
    },
  );

  return (
    <article className={articleClass} id={`message-${messageId}`}>
      <Markdown
        renderer={{
          text: (text) => (
            <motion.span
              variants={REVEAL_ANIMATION_VARIANTS}
              animate={"visible"}
              initial={animate ? "hidden" : "visible"}
            >
              {text}
            </motion.span>
          ),
          paragraph: renderParagraph,
          em: renderEm,
          heading: renderHeading,
          hr: renderHr,
          link: (href, text) => renderLink(href, text, messageId),
          image: renderImage,
          blockquote: renderBlockquote,
          list: renderList,
          listItem: renderListItem,
          strong: renderStrong,
          code: renderCode,
          codespan: renderCodespan,
        }}
      >
        {message}
      </Markdown>
    </article>
  );
};

Mdx.displayName = "Mdx";

export { Mdx };

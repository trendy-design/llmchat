import { CodeBlock } from "@/components/ui/codeblock";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { REVEAL_ANIMATION_VARIANTS } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/clsx";
import { isValidUrl } from "@/lib/utils/utils";
import { ArrowUpRight } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Markdown from "marked-react";
import Link from "next/link";
import { FC, ReactNode } from "react";
import { Flex, Type } from ".";
import { mono } from "../../app/fonts";
import { SearchFavicon } from "../tools/search-favicon";

export type TMdx = {
  message?: string;
  animate: boolean;
  messageId?: string;
  size?: "xs" | "sm" | "base";
};

const Mdx: FC<TMdx> = ({ message, animate, messageId, size = "base" }) => {
  // const [processedMessage, setProcessedMessage] = useState("");

  // useEffect(() => {
  //   if (message) {
  //     // Process the message to hide incomplete Markdown elements
  //     const processed = hideIncompleteMarkdown(message);
  //     setProcessedMessage(processed);
  //   }
  // }, [message]);

  // const hideIncompleteMarkdown = (text: string) => {
  //   // Remove incomplete links
  //   text = text.replace(/\[([^\]]*)\](\([^\)]*\)?)?/g, (match, text, url) => {
  //     return url && url.endsWith(")") ? match : "";
  //   });

  //   // Remove incomplete images
  //   text = text.replace(/!\[([^\]]*)\]\(([^\)]*)\)/g, (match, alt, src) => {
  //     return src && src.endsWith(")") ? match : "";
  //   });

  //   // Remove incomplete table cells
  //   text = text.replace(/\|([^\|]+)\|/g, (match, text) => {
  //     return text ? match : "";
  //   });

  //   // Remove incomplete table cells (duplicate, can be removed)
  //   text = text.replace(/\|([^\|]+)\|/g, (match, text) => {
  //     return text ? match : "";
  //   });

  //   return text;
  // };

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
    <hr className="my-4 border-black/5 dark:border-white/5" />
  );
  const renderLink = (href: string, text: ReactNode, messageId: string) => {
    if (text && isValidUrl(href)) {
      const url = new URL(href).host;

      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Link
              href={href}
              target="_blank"
              data-message-id={messageId}
              className="font-normal text-teal-600 !no-underline dark:text-teal-600"
            >
              {text}
            </Link>
          </HoverCardTrigger>
          <HoverCardContent
            sideOffset={12}
            className="flex max-w-[400px] cursor-pointer flex-col items-start rounded-lg p-2"
            onClick={() => {
              window.open(href, "_blank");
            }}
          >
            <Flex gap="sm" items="start" className="w-full text-zinc-500">
              <SearchFavicon link={url} className="!m-0 !mt-1" size="md" />
              <Type
                size="sm"
                textColor="secondary"
                className="line-clamp-2 flex-1"
              >
                {href}
              </Type>
              <ArrowUpRight
                size={16}
                weight="bold"
                className="mt-1 flex-shrink-0"
              />
            </Flex>
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
    <span
      style={mono.style}
      className="rounded-md border bg-zinc-50 px-1 py-0.5 text-xs text-zinc-800 dark:bg-white/10 dark:text-white"
    >
      {code}
    </span>
  );

  const articleClass = cn(
    "prose dark:prose-invert pt-2 pb-8 max-w-full prose-zinc prose-h3:font-medium prose-h4:font-medium prose-h5:font-medium prose-h6:font-medium prose-h3:text-base md:prose-h3:text-base prose-h4:text-sm md:prose-h4:text-base prose-h5:text-sm md:prose-h5:text-base prose-h6:text-sm md:prose-h6:text-base prose-heading:font-medium prose-strong:font-medium prose-headings:text-base prose-th:text-sm",
    {
      "prose-sm": size === "sm",
      "prose-sm md:prose-sm": size === "base",
      "prose-xs": size === "xs",
    },
  );

  const renderBr = () => <br />;

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
          br: renderBr,
          link: (href, text) => renderLink(href, text, messageId),
          image: renderImage,
          blockquote: renderBlockquote,
          list: renderList,
          listItem: renderListItem,
          strong: renderStrong,
          code: renderCode,
          codespan: renderCodespan,
        }}
        openLinksInNewTab={true}
      >
        {message}
      </Markdown>
    </article>
  );
};

Mdx.displayName = "Mdx";

export { Mdx };

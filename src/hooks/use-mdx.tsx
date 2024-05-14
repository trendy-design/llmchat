import { CodeBlock } from "@/components/codeblock";
import { motion } from "framer-motion";
import Markdown from "marked-react";

const variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 3, ease: "easeInOut", delay: 0.1 },
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
              className="text-zinc-100"
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
              return (
                <motion.ol
                  className="list-decimal ml-8"
                  initial="hidden"
                  animate="visible"
                >
                  {children}
                </motion.ol>
              );
            }
            return (
              <motion.ul
                className="list-disc ml-8"
                initial="hidden"
                animate="visible"
              >
                {children}
              </motion.ul>
            );
          },
          listItem: (children) => (
            <motion.li className="my-4" initial="hidden" animate="visible">
              <p className="text-sm leading-7 ">{children}</p>
            </motion.li>
          ),
          strong: (children) => (
            <motion.strong
              initial="hidden"
              animate="visible"
              className="font-semibold"
            >
              {children}
            </motion.strong>
          ),
          code: (code, lang) => {
            return (
              <motion.div
                className="my-4 w-full"
                initial="hidden"
                animate="visible"
              >
                <CodeBlock lang={lang} code={code?.toString()} />
              </motion.div>
            );
          },
          codespan(code, lang) {
            return (
              <motion.span
                initial="hidden"
                animate="visible"
                className="px-2 py-1 text-xs rounded-md text-purple-300 bg-purple-600/30"
              >
                {code}
              </motion.span>
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

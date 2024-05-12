import hljs from "highlight.js";
import { useEffect, useRef } from "react";

import { useClipboard } from "@/hooks/use-clipboard";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";

export type codeBlockProps = {
  lang?: string;
  code?: string;
};

export const CodeBlock = ({ lang, code }: codeBlockProps) => {
  const ref = useRef<HTMLElement>(null);
  const { copiedText, copy, showCopied } = useClipboard();
  const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";

  useEffect(() => {
    if (ref?.current && code) {
      const highlightedCode = hljs.highlight(language, code).value;
      ref.current.innerHTML = highlightedCode;
    }
  }, [code, language]);

  return (
    <div className="hljs-wrapper">
      <div className="pl-4 pr-2 py-2 w-full flex justify-between items-center">
        <p className="text-xs">{language}</p>
        <Button
          size="iconXS"
          onClick={() => {
            code && copy(code);
          }}
        >
          {showCopied ? <CheckIcon /> : <CopyIcon />}
          {showCopied ? "copied" : "copy"}
        </Button>
      </div>
      <pre className="hljs-pre">
        <code className={`hljs language-${language}`} ref={ref}></code>
      </pre>
    </div>
  );
};

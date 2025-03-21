"use client";

import Prism from "prismjs";
import { useEffect, useRef } from "react";

import { useClipboard } from "@/hooks/use-clipboard";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-python";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-yaml";

import { Button, cn } from "@repo/ui";
import { IconCheck, IconCopy, IconFileFilled } from "@tabler/icons-react";
import "./code-block.css";

export type CodeBlockProps = {
  lang?: string;
  code?: string;
  showHeader?: boolean;
  variant?: "default" | "secondary";
};

export const CodeBlock = ({
  lang = "plaintext",
  code,
  showHeader = true,
  variant = "default",
}: CodeBlockProps) => {
  const ref = useRef<HTMLElement>(null);
  const { copy, showCopied } = useClipboard();

  useEffect(() => {
    if (ref?.current && code) {
      Prism.highlightElement(ref.current);
    }
  }, [code, lang]);

  return (
    <div className={cn("not-prose w-full rounded-lg overflow-hidden bg-background border border-border my-4", variant === "secondary" && "bg-secondary")}>
      {showHeader && (
        <div className="flex items-center pl-4 pr-1.5 py-1 bg-secondary/50 border-b border-border justify-between text-foreground">
      
          <p className="text-muted-foreground text-xs tracking-wide flex flex-row items-center gap-2">
          <IconFileFilled size={14} className="opacity-50" />
            {lang}</p>
          <Button
            variant="ghost"
            size="xs"
            className="gap-2"
            onClick={() => {
              code && copy(code);
            }}
          >
            {showCopied ? (
              <IconCheck size={14} strokeWidth="2" />
            ) : (
              <IconCopy size={14} strokeWidth="2" />
            )}
          </Button>
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-3 text-[13px] text-foreground">
        <code className={cn(`language-${lang}`)} ref={ref}>
          {code}
        </code>
      </pre>
    </div>
  );
};

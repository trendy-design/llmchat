"use client";

import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-python";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-yaml";
import { useCallback, useEffect, useRef, useState } from "react";


import { Button, cn } from "@repo/ui";
import { IconCheck, IconCopy, IconFileFilled } from "@tabler/icons-react";
import "./code-block.css";

export type CodeBlockProps = {
  lang?: string;
  code?: string;
  showHeader?: boolean;
  variant?: "default" | "secondary";
  maxHeight?: number;
};

export const CodeBlock = ({
  lang = "plaintext",
  code,
  showHeader = true,
  variant = "default",
  maxHeight = 400,
}: CodeBlockProps) => {
  const ref = useRef<HTMLElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const { copy, showCopied } = useClipboard();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);

  useEffect(() => {
    if (ref?.current && code) {
      Prism.highlightElement(ref.current);
    }
  }, [code, lang]);

  useEffect(() => {
    if (preRef.current) {
      setShowExpandButton(preRef.current.scrollHeight > maxHeight);
    }
  }, [code, maxHeight]);

  return (
    <div className={cn("not-prose w-full rounded-xl overflow-hidden bg-background border border-border my-4", variant === "secondary" && "bg-secondary")}>
      {showHeader && (
        <div className="flex items-center pl-4 pr-1.5 py-1 bg-background border-b border-border justify-between text-foreground">
          <p className="text-muted-foreground text-xs tracking-wide flex flex-row items-center gap-2">
            <IconFileFilled size={14} className="opacity-50" />
            {lang}
          </p>
          <Button
            variant="ghost"
            size="xs"
            className="gap-2"
            onClick={() => code && copy(code)}
          >
            {showCopied ? (
              <IconCheck size={14} strokeWidth="2" />
            ) : (
              <IconCopy size={14} strokeWidth="2" />
            )}
          </Button>
        </div>
      )}
      <div className="relative">
        <pre 
          ref={preRef}
          className="overflow-x-auto px-6 py-4 text-[13px] text-foreground"
          style={{
            maxHeight: isExpanded ? 'none' : maxHeight,
            transition: 'max-height 0.3s ease-in-out'
          }}
        >
          <code className={cn(`language-${lang}`)} ref={ref}>
            {code}
          </code>
        </pre>
        {showExpandButton && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pointer-events-none">
            <div className="w-full h-16 bg-gradient-to-b from-transparent via-background/85 to-background flex items-center justify-center">
              <Button
                variant="secondary"
                size="xs"
                rounded="full"
                className="pointer-events-auto relative z-10 px-4"
                onClick={() => setIsExpanded(true)}
              >
                Show more
              </Button>
            </div>
          </div>
        )}
        {showExpandButton && isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pointer-events-none">

          <div className="w-full bg-gradient-to-b from-transparent via-background/85 to-background flex items-center justify-center py-2">
            <Button
              variant="secondary"
              size="xs"
              rounded="full"
              className="px-4"
              onClick={() => setIsExpanded(false)}
            >
              Show less
            </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

export function useClipboard() {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);
  const [showCopied, setShowCopied] = useState<boolean>(false);

  const copy: CopyFn = useCallback(async text => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setShowCopied(true);
      setTimeout(() => {
        setShowCopied(false);
      }, 2000);
      return true;
    } catch (error) {
      console.warn('Copy failed', error);
      setCopiedText(null);
      return false;
    }
  }, []);

  return { copiedText, copy, showCopied };
}

'use client';

import { useClipboard } from '@/hooks/use-clipboard';
import Prism from 'prismjs';
import { useEffect, useRef } from 'react';

import { Check, Copy } from 'lucide-react';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-yaml';

import { Button, cn } from '@repo/ui';
import './code-block.css';

export type CodeBlockProps = {
  lang?: string;
  code?: string;
  showHeader?: boolean;
};

export const CodeBlock = ({ lang = 'plaintext', code, showHeader = true }: CodeBlockProps) => {
  const ref = useRef<HTMLElement>(null);
  const { copy, showCopied } = useClipboard();

  useEffect(() => {
    if (ref?.current && code) {
      Prism.highlightElement(ref.current);
    }
  }, [code, lang]);

  return (
    <div className="not-prose border-border bg-tertiary my-4 rounded-xl border p-1">
      {showHeader && (
        <div className="text-foreground flex items-center justify-between pb-1 pl-2">
          <p className="text-muted-foreground text-xs tracking-wide">{lang}</p>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => {
              code && copy(code);
            }}
          >
            {showCopied ? <Check size={12} strokeWidth="2" /> : <Copy size={12} strokeWidth="2" />}
            <span>Copy</span>
          </Button>
        </div>
      )}
      <pre className="border-border bg-background text-foreground overflow-x-auto rounded-lg border p-4">
        <code className={cn(`language-${lang}`)} ref={ref}>
          {code}
        </code>
      </pre>
    </div>
  );
};

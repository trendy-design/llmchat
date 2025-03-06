'use client';

import { useClipboard } from '@/hooks/use-clipboard';
import { Button } from '@repo/ui';
import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createHighlighter } from 'shiki';

import './code-block.css';

export type CodeBlockProps = {
  lang?: string;
  code?: string;
  showHeader?: boolean;
};

export const CodeBlock = ({ lang = 'plaintext', code, showHeader = true }: CodeBlockProps) => {
  const codeRef = useRef<HTMLDivElement>(null);
  const { copy, showCopied } = useClipboard();
  const [highlightedCode, setHighlightedCode] = useState<string>('');

  useEffect(() => {
    const highlight = async () => {
      if (!code) return;

      const highlighter = await createHighlighter({
        themes: ['github-dark', 'github-light'],
        langs: ['typescript', 'javascript', 'python', 'bash', 'json', 'yaml', 'markdown', 'plaintext'],
      
      });

      const html = highlighter.codeToHtml(code, { lang, themes: {
        light: 'github-light',
        dark: 'github-dark',
      }});
      setHighlightedCode(html);
    };

    highlight();
  }, [code, lang]);

  return (
    <div className="not-prose bg-background/50 border-border my-4 rounded-lg overflow-hidden border p-0">
      {showHeader && (
        <div className="text-foreground flex items-center bg-secondary border-b border-border justify-between py-1.5 pl-3 pr-1.5">
          <p className="text-muted-foreground text-xs tracking-wide">{lang}</p>
          <Button
            variant="ghost"
            size="icon-xs"
            className="gap-2"
            onClick={() => code && copy(code)}
          >
            {showCopied ? <Check size={12} strokeWidth="2" /> : <Copy size={12} strokeWidth="2" />}
          </Button>
        </div>
      )}
      <div className=" text-muted-foreground  text-sm overflow-x-auto font-mono p-4">
        <div
          ref={codeRef}
          className="[&>pre]:!bg-transparent [&>pre]:!font-mono [&>pre]:!github-light dark:[&>pre]:!github-dark"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </div>
    </div>
  );
};

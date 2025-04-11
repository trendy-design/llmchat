'use client';

import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-yaml';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button, cn } from '@repo/ui';
import {
    IconBrandJavascript,
    IconBrandPython,
    IconBrandReact,
    IconBrandTypescript,
    IconCheck,
    IconCopy,
    IconFileFilled,
    IconJson,
    IconMarkdown,
    IconTerminal,
} from '@tabler/icons-react';
import './code-block.css';

export type CodeBlockProps = {
    lang?: string;
    code?: string;
    showHeader?: boolean;
    variant?: 'default' | 'secondary';
    maxHeight?: number;
    className?: string;
};

export const CodeBlock = ({
    lang = 'plaintext',
    code,
    showHeader = true,
    variant = 'default',
    maxHeight = 400,
    className,
}: CodeBlockProps) => {
    const ref = useRef<HTMLElement>(null);
    const preRef = useRef<HTMLPreElement>(null);
    const { copy, showCopied } = useClipboard();

    useEffect(() => {
        if (ref?.current && code) {
            Prism.highlightElement(ref.current);
        }
    }, [code, lang]);

    const getLangIcon = () => {
        switch (lang) {
            case 'bash':
                return <IconTerminal size={14} />;
            case 'json':
                return <IconJson size={14} />;
            case 'yaml':
                return <IconJson size={14} />;
            case 'python':
                return <IconBrandPython size={14} />;
            case 'javascript':
                return <IconBrandJavascript size={14} />;
            case 'typescript':
                return <IconBrandTypescript size={14} />;
            case 'jsx':
                return <IconBrandReact size={14} />;
            case 'markdown':
                return <IconMarkdown size={14} />;
            case 'plaintext':
                return <IconFileFilled size={14} />;
            default:
                return <IconFileFilled size={14} />;
        }
    };

    return (
        <div
            className={cn(
                'not-prose bg-tertiary  relative my-4 w-full overflow-hidden rounded-xl border px-1 pb-1',
                variant === 'secondary' && 'bg-secondary',
                className,
                !showHeader && 'rounded-none border-none bg-transparent p-0'
            )}
        >
            {showHeader && (
                <div className="text-foreground flex items-center justify-between py-1 pl-3 pr-1">
                    <p className="text-muted-foreground flex flex-row items-center gap-2 text-xs tracking-wide">
                        {getLangIcon()}
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
            <pre
                ref={preRef}
                className={cn(
                    'text-foreground border-border bg-background no-scrollbar relative overflow-x-auto rounded-lg border px-6 py-4 font-mono text-[13px] font-[300]'
                )}
            >
                <code className={cn(`language-${lang}`)} ref={ref}>
                    {code}
                </code>
            </pre>
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

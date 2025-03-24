'use client';

import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
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
                'not-prose bg-background border-border relative my-4 w-full overflow-hidden rounded-xl border',
                variant === 'secondary' && 'bg-secondary',
                showExpandButton && isExpanded && 'pb-12',
                className
            )}
        >
            {showHeader && (
                <div className="bg-background border-border text-foreground flex items-center justify-between border-b py-1 pl-4 pr-1.5">
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
                className="text-foreground overflow-x-auto px-6 py-4 font-mono text-[13px] font-[300]"
                style={{
                    maxHeight: isExpanded ? 'none' : maxHeight,
                    transition: 'max-height 0.3s ease-in-out',
                }}
            >
                <code className={cn(`language-${lang}`)} ref={ref}>
                    {code}
                </code>
            </pre>
            {showExpandButton && !isExpanded && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-col items-center">
                    <div className="via-background/85 to-background flex h-16 w-full items-center justify-center bg-gradient-to-b from-transparent">
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
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
                    <div className="via-background/85 to-background flex w-full items-center justify-center bg-gradient-to-b from-transparent py-2">
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

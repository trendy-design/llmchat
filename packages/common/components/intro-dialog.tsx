import { useUser } from '@clerk/nextjs';
import { cn, Dialog, DialogContent } from '@repo/ui';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { DarkLogo } from './logo';
export const IntroDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isSignedIn } = useUser();

    useEffect(() => {
        const hasSeenIntro = localStorage.getItem('hasSeenIntro');
        if (!hasSeenIntro) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('hasSeenIntro', 'true');
        setIsOpen(false);
    };

    const icon = (
        <IconCircleCheckFilled className="text-muted-foreground/50 mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full" />
    );

    const points = [
        {
            icon,
            text: `**Privacy-focused**: Your chat history never leaves your device.`,
        },
        {
            icon,
            text: `**Open source**: Fully transparent and modifiable. Easily deploy it yourself.`,
        },
        {
            icon,
            text: `**Research-friendly**: Leverage Web Search, Pro Search, and Deep Research features.`,
        },
        {
            icon,
            text: `**Comprehensive model support**: Compatible with all mainstream model providers.`,
        },
        {
            icon,
            text: `**BYOK (Bring Your Own Key)**: Use your own API key for unlimited chat.`,
        },
        {
            icon,
            text: `**MCP Compatibility**: Connect with any MCP servers/tools (coming soon).`,
        },
        {
            icon,
            text: `**Usage Tracking**: Monitor your model usage without paying (coming soon).`,
        },
    ];

    if (isSignedIn) {
        return null;
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={open => {
                if (open) {
                    setIsOpen(true);
                } else {
                    handleClose();
                }
            }}
        >
            <DialogContent
                ariaTitle="Introduction"
                className="flex max-w-[420px] flex-col gap-0 overflow-hidden p-0"
            >
                <div className="relative h-[100px] w-full bg-emerald-700">
                    <div className="absolute inset-0 z-10 flex h-full flex-col justify-end gap-2 p-4">
                        <div
                            className={cn(
                                'flex h-8 w-full cursor-pointer items-center justify-start gap-1.5'
                            )}
                        >
                            <DarkLogo className="size-6 text-white" />
                            <p className="font-clash text-lg font-bold tracking-wide text-white">
                                llmchat.co
                            </p>
                        </div>
                    </div>
                    <div
                        style={{
                            backgroundImage: 'url(/icons/image.png)',
                            backgroundSize: 'cover',
                        }}
                        className="z-1 absolute inset-0 flex h-full w-full bg-emerald-500/70 bg-cover bg-center bg-no-repeat bg-blend-hard-light"
                    />
                </div>
                <div className="flex flex-col gap-8 p-5">
                    <p className="text-base font-semibold">
                        Private, Open-Source, and Built for You
                    </p>

                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold">Key benefits:</h3>

                        <div className="flex flex-col items-start gap-1.5">
                            {points.map((point, index) => (
                                <div key={index} className="flex-inline flex items-start gap-2">
                                    {point.icon}
                                    <ReactMarkdown
                                        className="text-sm"
                                        components={{
                                            p: ({ children }) => (
                                                <p className="text-muted-foreground text-sm">
                                                    {children}
                                                </p>
                                            ),
                                            strong: ({ children }) => (
                                                <span className="text-sm font-semibold">
                                                    {children}
                                                </span>
                                            ),
                                        }}
                                    >
                                        {point.text}
                                    </ReactMarkdown>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

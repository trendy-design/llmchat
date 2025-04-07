import { Button, cn, Dialog, DialogContent } from '@repo/ui';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { DarkLogo } from './logo';
export const IntroDialog = () => {
    const [isOpen, setIsOpen] = useState(false);

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
        <IconCircleCheckFilled className=" text-muted-foreground/50 mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full" />
    );

    const points = [
        {
            icon,
            text: '**Local storage**: All conversations stay on your device.',
        },
        {
            icon,
            text: '**Open source**: Transparent code you can inspect and modify.',
        },
        {
            icon,
            text: `**Privacy-focused**: Your data doesn't leave your device.`,
        },
        {
            icon,
            text: `**Simple signup**: Create an account to manage your daily message allowance.`,
        },
        {
            icon,
            text: `**Research capabilities**: Helpful for complex tasks and projects.`,
        },
    ];

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
                                'flex h-8 w-full cursor-pointer  items-center justify-start gap-1.5'
                            )}
                        >
                            <DarkLogo className="size-6 text-white" />
                            <p className="font-clash text-lg font-bold tracking-wide text-white">
                                deep.new
                            </p>
                        </div>
                    </div>
                    <div
                        style={{
                            backgroundImage: 'url(/icons/image.png)',
                            backgroundSize: 'cover',
                        }}
                        className=" z-1 absolute inset-0 flex h-full w-full bg-emerald-500/70 bg-cover bg-center bg-no-repeat bg-blend-hard-light"
                    />
                </div>
                <div className="flex flex-col gap-8 p-5">
                    <p className="text-base">Private, open-source, and built for you.</p>

                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold">Key features</h3>

                        <div className="flex flex-col items-start gap-1">
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

                    <div className="flex flex-col items-start text-center text-lg">
                        <p className="text-sm font-medium">
                            Sign up to start using your daily message allowance.
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Your privacy remains our priority.
                        </p>
                        <Button rounded="full" onClick={handleClose} className="mt-4">
                            Sign up
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

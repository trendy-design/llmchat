import { Source } from '@repo/common/store';
import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
    WebsitePreview,
} from '@repo/ui';
import { useState } from 'react';

export const SourceList = ({
    children,
    sources,
}: {
    children: React.ReactNode;
    sources: Source[];
}) => {
    const [isOpen, setIsOpen] = useState(false);
    if (!sources || !Array.isArray(sources) || sources?.length === 0) {
        return null;
    }

    const sortedSources = [...sources].sort((a, b) => a?.index - b?.index);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent ariaTitle="Sources" className="border-none p-0">
                <DialogTitle className="p-4">Sources</DialogTitle>
                <div className="flex max-h-[50vh] flex-col gap-6 overflow-y-auto px-6 pb-6">
                    {sortedSources.map(source => (
                        <div className="flex flex-row items-start gap-2" key={source.link}>
                            <div className="text-muted-foreground group inline-flex size-5 shrink-0 flex-row items-center justify-center gap-1 rounded-sm text-sm">
                                {source?.index}.
                            </div>

                            <WebsitePreview key={source.link} source={source} />
                        </div>
                    ))}
                </div>
                <DialogFooter className="border-t p-4">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setIsOpen(false);
                        }}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

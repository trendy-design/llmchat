import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
    WebsitePreview,
} from '@repo/ui';
import { useContext, useState } from 'react';
import { CitationProviderContext } from '../citation-provider';

export const SourceList = ({
    children,
    otherSources,
}: {
    children: React.ReactNode;
    otherSources: string[];
}) => {
    const { citations } = useContext(CitationProviderContext);
    const [isOpen, setIsOpen] = useState(false);

    if (Object.keys(citations).length === 0 && otherSources.length === 0) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent ariaTitle="Sources" className="border-none p-0">
                <DialogTitle className="p-4">Sources</DialogTitle>
                <div className="flex max-h-[50vh] flex-col gap-6 overflow-y-auto px-6 pb-6">
                    {Object.entries(citations).map(([url, citation]) => (
                        <div className="flex flex-row items-start gap-2" key={url}>
                            <div className="text-muted-foreground group inline-flex size-5 shrink-0 flex-row items-center justify-center gap-1 rounded-sm text-sm">
                                {citation?.index}.
                            </div>

                            <WebsitePreview key={url} url={url} />
                        </div>
                    ))}
                    {otherSources?.map(source => (
                        <div className="flex flex-row items-start gap-2" key={source}>
                            <div className="text-muted-foreground group inline-flex size-5 shrink-0 flex-row items-center justify-center gap-1 rounded-sm text-sm">
                                {''}
                            </div>
                            <WebsitePreview url={source} />
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

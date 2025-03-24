import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
    WebsitePreview,
} from '@repo/ui';
import { IconLink } from '@tabler/icons-react';
import { ChevronRight } from 'lucide-react';
import { useContext, useState } from 'react';
import { LinkFavicon } from '../../link-favicon';
import { CitationProviderContext } from '../citation-provider';

export const SourceList = () => {
    const { citations } = useContext(CitationProviderContext);
    const [isOpen, setIsOpen] = useState(false);

    if (Object.keys(citations).length === 0) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="bordered"
                    size="sm"
                    rounded="full"
                    tooltip="Sources"
                    className="gap-2"
                >
                    <IconLink size={16} strokeWidth={2} />
                    <div className="flex flex-row gap-1">
                        {Object.values(citations)
                            ?.slice(0, 4)
                            ?.map(citation => <LinkFavicon link={citation.url} size="sm" />)}
                    </div>
                    <ChevronRight size={16} strokeWidth={2} />
                </Button>
            </DialogTrigger>

            <DialogContent ariaTitle="Sources" className="border-none p-0">
                <DialogTitle className="p-4">Sources</DialogTitle>
                <div className="flex max-h-[50vh] flex-col gap-6 overflow-y-auto px-6 pb-6">
                    {Object.entries(citations).map(([url, citation]) => (
                        <div className="flex flex-row items-start gap-2">
                            <div className="text-muted-foreground group inline-flex size-5 shrink-0 flex-row items-center justify-center gap-1 rounded-sm text-xs">
                                {citation?.index}.
                            </div>

                            <WebsitePreview key={url} url={url} />
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

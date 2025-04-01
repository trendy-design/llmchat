import { IconCornerDownRight } from '@tabler/icons-react';

export const ImageMessage = ({ imageAttachment }: { imageAttachment: string }) => {
    return (
        <div className="flex flex-row items-center gap-2 p-1">
            <IconCornerDownRight size={16} className="text-muted-foreground/50" />
            <div className="relative flex size-12 flex-row items-center gap-2 ">
                <div className="border-border absolute inset-0 rounded-lg border" />
                <img src={imageAttachment} alt="image" className="absolute inset-0 rounded-lg" />
            </div>
        </div>
    );
};

import { IconCornerDownRight } from '@tabler/icons-react';

export const ImageMessage = ({ imageAttachment }: { imageAttachment: string }) => {
    return (
        <div className="flex flex-row items-center gap-2 p-1">
            <IconCornerDownRight size={16} className="text-muted-foreground/50" />
            <div className="relative flex w-12 flex-row items-center gap-2 ">
                <img src={imageAttachment} alt="image" className="relative inset-0 rounded-lg" />
            </div>
        </div>
    );
};

import { FC } from 'react';
import { DropzoneState } from 'react-dropzone';
import { ImageDropzone } from './image-dropzone';

export type IImageDropzoneRootProps = {
    children: React.ReactNode;
    dropzoneProps: DropzoneState;
};
export const ImageDropzoneRoot: FC<IImageDropzoneRootProps> = ({ children, dropzoneProps }) => {
    return (
        <div
            className="relative flex w-full flex-col items-start gap-0"
            {...dropzoneProps.getRootProps()}
        >
            {children}

            <ImageDropzone dropzonProps={dropzoneProps} />
        </div>
    );
};

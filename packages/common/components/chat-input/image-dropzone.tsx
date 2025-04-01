import { Flex } from '@repo/ui';
import { IconPhotoPlus } from '@tabler/icons-react';
import { FC } from 'react';
import { DropzoneState } from 'react-dropzone';

export type TImageDropzone = {
    dropzonProps: DropzoneState;
};
export const ImageDropzone: FC<TImageDropzone> = ({ dropzonProps }) => {
    return (
        <>
            <input {...dropzonProps.getInputProps()} />
            {dropzonProps.isDragActive && (
                <Flex
                    className="bg-secondary/90 absolute inset-0 z-10 overflow-hidden rounded-lg"
                    items="center"
                    justify="center"
                    gap="sm"
                >
                    <IconPhotoPlus size={16} className="text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                        Drag and drop an image here, or click to select an image
                    </p>
                </Flex>
            )}
        </>
    );
};

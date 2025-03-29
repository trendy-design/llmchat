import { Flex, Type } from '@repo/ui';
import { ImagePlus } from 'lucide-react';
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
          className="bg-background/50 absolute inset-0 z-10 backdrop-blur-sm"
          items="center"
          justify="center"
          gap="sm"
        >
          <ImagePlus size={16} strokeWidth={2} className="text-muted-foreground" />
          <Type size="sm" textColor="secondary">
            Drag and drop an image here, or click to select an image
          </Type>
        </Flex>
      )}
    </>
  );
};

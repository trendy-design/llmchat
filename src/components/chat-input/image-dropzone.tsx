import { ImageAdd01Icon } from "@hugeicons/react";
import { FC } from "react";
import { DropzoneState } from "react-dropzone";
import { Flex, Type } from "../ui";

export type TImageDropzone = {
  dropzonProps: DropzoneState;
};
export const ImageDropzone: FC<TImageDropzone> = ({ dropzonProps }) => {
  return (
    <>
      <input {...dropzonProps.getInputProps()} />
      {dropzonProps.isDragActive && (
        <Flex
          className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm dark:bg-black/50"
          items="center"
          justify="center"
          gap="sm"
        >
          <ImageAdd01Icon size={16} strokeWidth={2} className="text-zinc-500" />
          <Type size="sm" textColor="secondary">
            Drag and drop an image here, or click to select an image
          </Type>
        </Flex>
      )}
    </>
  );
};

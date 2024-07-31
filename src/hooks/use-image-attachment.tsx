import { TAttachment } from "@/components/chat-input";
import { Flex, Tooltip, Type } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { ImageAdd01Icon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/use-toast";
import { X } from "@phosphor-icons/react";
import Image from "next/image";
import { ChangeEvent, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Resizer from "react-image-file-resizer";

export type TRenderImageUpload = {
  showIcon?: boolean;
  label?: string;
  tooltip?: string;
};

export type TUseImageAttachment = {
  id: string;
};

export const useImageAttachment = ({ id }: TUseImageAttachment) => {
  const [attachment, setAttachment] = useState<TAttachment>();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("ACCEPTED FILES", acceptedFiles);
    const file = acceptedFiles?.[0];
    readImageFile(file);
  }, []);
  const dropzonProps = useDropzone({ onDrop, multiple: false, noClick: true });
  const { toast } = useToast();

  const resizeFile = (file: File) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        1000,
        1000,
        "JPEG",
        100,
        0,
        (uri) => {
          resolve(uri);
        },
        "file",
      );
    });

  const clearAttachment = () => {
    setAttachment(undefined);
  };

  const readImageFile = async (file?: File) => {
    const reader = new FileReader();

    const fileTypes = ["image/jpeg", "image/png", "image/gif"];
    if (file && !fileTypes.includes(file?.type)) {
      toast({
        title: "Invalid format",
        description: "Please select a valid image (JPEG, PNG, GIF).",
        variant: "destructive",
      });
      return;
    }

    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const base64String = reader?.result?.split(",")[1];
      setAttachment((prev) => ({
        ...prev,
        base64: `data:${file?.type};base64,${base64String}`,
      }));
    };

    if (file) {
      setAttachment((prev) => ({
        ...prev,
        file,
      }));
      const resizedFile = await resizeFile(file);

      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    readImageFile(file);
  };

  const handleFileSelect = () => {
    document.getElementById(id)?.click();
  };
  const renderAttachedImage = () => {
    if (attachment?.base64) {
      return (
        <div className="relative h-[60px] min-w-[60px] rounded-lg border border-black/10 shadow-md dark:border-white/10">
          <Image
            src={attachment.base64}
            alt="uploaded image"
            className="h-full w-full overflow-hidden rounded-lg object-cover"
            width={0}
            height={0}
          />

          <Button
            size={"iconXS"}
            variant="default"
            onClick={clearAttachment}
            className="absolute right-[-4px] top-[-4px] z-10 h-4 w-4 flex-shrink-0"
          >
            <X size={12} weight="bold" />
          </Button>
        </div>
      );
    }
  };

  const renderImageUpload = ({
    showIcon,
    label,
    tooltip = "Attach an image",
  }: TRenderImageUpload) => {
    return (
      <>
        <input
          type="file"
          id={id}
          className="hidden"
          onChange={handleImageUpload}
        />
        <Tooltip content={tooltip}>
          {showIcon ? (
            <Button variant="ghost" size="iconSm" onClick={handleFileSelect}>
              <ImageAdd01Icon size={18} strokeWidth={2} />
            </Button>
          ) : (
            <Button variant="outlined" onClick={handleFileSelect}>
              {label}
            </Button>
          )}
        </Tooltip>
      </>
    );
  };

  const renderDropZone = () => {
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
            <ImageAdd01Icon
              size={18}
              strokeWidth={2}
              className="text-zinc-500"
            />
            <Type size="sm" textColor="secondary">
              Drag and drop an image here, or click to select an image
            </Type>
          </Flex>
        )}
      </>
    );
  };

  return {
    attachment,
    ...dropzonProps,
    handleImageUpload,
    handleFileSelect,
    clearAttachment,
    renderAttachedImage,
    renderImageUpload,
    renderDropZone,
    setAttachment,
  };
};

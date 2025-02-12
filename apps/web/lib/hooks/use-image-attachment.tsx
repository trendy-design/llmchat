import { TAttachment } from "@repo/shared/types";
import { useToast } from "@repo/ui";
import { ChangeEvent, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

// const resizeFile = (file: File) =>
//   new Promise((resolve) => {
//     Resizer.imageFileResizer(
//       file,
//       1000,
//       1000,
//       "JPEG",
//       100,
//       0,
//       (uri) => {
//         resolve(uri);
//       },
//       "file",
//     );
//   });

export type TRenderImageUpload = {
  showIcon?: boolean;
  label?: string;
  tooltip?: string;
};

export const useImageAttachment = () => {
  const [attachment, setAttachment] = useState<TAttachment>();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles?.[0];
    readImageFile(file);
  }, []);
  const dropzonProps = useDropzone({ onDrop, multiple: false, noClick: true });
  const { toast } = useToast();

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
      // const resizedFile = await resizeFile(file);

      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    readImageFile(file);
  };

  return {
    attachment,
    dropzonProps,
    handleImageUpload,
    clearAttachment,
    setAttachment,
  };
};

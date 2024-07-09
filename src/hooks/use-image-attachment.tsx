import { TAttachment } from "@/components/chat-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ImageUpload01Icon } from "@hugeicons/react";
import { X } from "@phosphor-icons/react";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import Resizer from "react-image-file-resizer";

export const useImageAttachment = () => {
  const [attachment, setAttachment] = useState<TAttachment>();
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
        "file"
      );
    });

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

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

  const handleFileSelect = () => {
    document.getElementById("fileInput")?.click();
  };
  const renderAttachedImage = () => {
    if (attachment?.base64 && attachment?.file) {
      return (
        <div className="rounded-xl relative min-w-[60px] h-[60px] border border-white/5  shadow-md">
          <Image
            src={attachment.base64}
            alt="uploaded image"
            className="w-full h-full object-cover rounded-xl overflow-hidden"
            width={0}
            height={0}
          />

          <Button
            size={"iconXS"}
            variant="default"
            onClick={() => {}}
            className="flex-shrink-0 w-4 h-4 z-10 absolute top-[-4px] right-[-4px]"
          >
            <X size={12} weight="bold" />
          </Button>
        </div>
      );
    }
  };

  const renderFileUpload = () => {
    return (
      <>
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={handleImageUpload}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFileSelect}
          className="px-1.5"
        >
          <ImageUpload01Icon size={18} strokeWidth={1.5} />
        </Button>
      </>
    );
  };

  return {
    attachment,
    handleImageUpload,
    handleFileSelect,
    renderAttachedImage,
    renderFileUpload,
  };
};

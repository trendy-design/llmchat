import { Button } from "@/components/ui/button";
import { Pdf01Icon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/use-toast";
import { TAttachment } from "@/types";
import { X } from "@phosphor-icons/react";
import { ChangeEvent, useState } from "react";

export const useAttachment = () => {
  const [attachment, setAttachment] = useState<TAttachment>();
  const { toast } = useToast();

  const clearAttachment = () => {
    setAttachment(undefined);
  };

  const handlePdfUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    const fileTypes = ["application/pdf"];
    if (file && !fileTypes.includes(file?.type)) {
      toast({
        title: "Invalid format",
        description: "Please select a valid PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (file) {
      setAttachment((prev) => ({
        ...prev,
        file,
      }));
    }
  };

  const handleFileSelect = () => {
    document.getElementById("pdf-fileInput")?.click();
  };

  const renderAttachedPdf = () => {
    if (attachment?.file) {
      return (
        <div className="relative flex h-[60px] min-w-[60px] items-center justify-center rounded-xl border border-white/5 shadow-md">
          <Pdf01Icon size={24} />
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

  const renderPdfFileUpload = () => {
    return (
      <>
        <input
          type="file"
          id="pdf-fileInput"
          className="hidden"
          onChange={handlePdfUpload}
        />
        <Button onClick={handleFileSelect}>
          <Pdf01Icon size={16} strokeWidth={1.5} />
          Upload PDF
        </Button>
      </>
    );
  };

  return {
    attachment,
    handlePdfUpload,
    handleFileSelect,
    clearAttachment,
    renderAttachedPdf,
    renderPdfFileUpload,
  };
};

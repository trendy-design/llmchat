import { TAttachment } from "@/lib/types";
import { Button, useToast } from "@/ui";
import { FileText, X } from "lucide-react";
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
          <FileText size={24} />
          <Button
            size={"iconXS"}
            variant="default"
            onClick={clearAttachment}
            className="absolute right-[-4px] top-[-4px] z-10 h-4 w-4 flex-shrink-0"
          >
            <X size={12} strokeWidth={2} />
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
          <FileText size={16} strokeWidth={1.5} />
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

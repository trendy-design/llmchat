import { TAttachment } from "@/components/chat-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Pdf01Icon } from "@hugeicons/react";
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

      const worker = new Worker(
        new URL("../worker/worker.ts", import.meta.url)
      );
      worker.postMessage(file);

      worker.onmessage = (event) => {
        const { content, error } = event.data;

        console.log(content, error);
        if (error) {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          });
        } else {
          setAttachment((prev) => ({
            ...prev,
            base64: content,
          }));
        }
      };
    }
  };

  const handleFileSelect = () => {
    document.getElementById("pdf-fileInput")?.click();
  };

  const renderAttachedPdf = () => {
    if (attachment?.file) {
      return (
        <div className="rounded-xl relative min-w-[60px] h-[60px] border border-white/5 shadow-md flex items-center justify-center">
          <Pdf01Icon size={24} />
          <Button
            size={"iconXS"}
            variant="default"
            onClick={clearAttachment}
            className="flex-shrink-0 w-4 h-4 z-10 absolute top-[-4px] right-[-4px]"
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
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFileSelect}
          className="px-1.5"
        >
          <Pdf01Icon size={18} strokeWidth={1.5} />
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

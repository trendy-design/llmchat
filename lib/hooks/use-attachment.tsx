import { AttachmentCard } from "@/components/messages/attachment-card";
import { TAttachment } from "@/lib/types";
import { Button, useToast } from "@/ui";
import { Paperclip } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { generateShortUUID } from "../utils/utils";

export const useAttachment = () => {
  const [attachment, setAttachment] = useState<TAttachment>();
  const [content, setContent] = useState<string>("");
  const { toast } = useToast();

  const clearAttachment = () => {
    setAttachment(undefined);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    const fileTypes = ["text/csv", "text/plain", "application/pdf"];
    if (file && !fileTypes.includes(file?.type)) {
      toast({
        title: "Invalid format",
        description: "Please select a valid CSV or TXT file.",
        variant: "destructive",
      });
      return;
    }

    const fileWorker = new Worker(
      new URL("../worker/worker.ts", import.meta.url),
    );

    console.log("file worker", fileWorker);
    fileWorker.postMessage({ file, documentId: generateShortUUID() });

    fileWorker.onmessage = (e) => {
      if (e.data.error) {
        toast({
          title: "Error",
          description: e.data.error,
          variant: "destructive",
        });
      }
      if (e.data.content) {
        setContent(e.data.content);
      }
    };

    if (file) {
      setAttachment((prev) => ({
        ...prev,
        file,
      }));
    }
  };

  const handleFileSelect = () => {
    document.getElementById("fileInputrt")?.click();
  };

  const renderAttachedFile = () => {
    if (!attachment) return null;
    return (
      <AttachmentCard
        attachment={{
          attachmentContent: content,
          attachmentName: attachment?.file?.name,
          attachmentSize: attachment?.file?.size,
          attachmentType: attachment?.file?.type,
        }}
        onClear={clearAttachment}
      />
    );
  };

  const renderFileUpload = () => {
    return (
      <>
        <input
          type="file"
          id="fileInputrt"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button onClick={handleFileSelect} variant="ghost" size={"iconXS"}>
          <Paperclip size={16} strokeWidth={2} />
        </Button>
      </>
    );
  };

  return {
    attachment,
    handleFileUpload,
    handleFileSelect,
    clearAttachment,
    renderAttachedFile,
    renderFileUpload,
    content,
  };
};

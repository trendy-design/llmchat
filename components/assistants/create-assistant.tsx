import { useAssistantUtils, useImageAttachment } from "@/lib/hooks";
import { TCustomAssistant } from "@/lib/types";
import { generateShortUUID } from "@/libs/utils/utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogOverlay,
  Flex,
  FormLabel,
  Input,
  Textarea,
} from "@/ui";
import { useFormik } from "formik";
import { Plus, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ImageAttachment } from "../chat-input/image-attachment";
import { ImageUpload } from "../chat-input/image-upload";

export type TCreateAssistant = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistant?: TCustomAssistant;
};

export const CreateAssistant = ({
  open,
  onOpenChange,
  assistant,
}: TCreateAssistant) => {
  const botTitleRef = useRef<HTMLInputElement | null>(null);
  const { assistants, createAssistantMutation, updateAssistantMutation } =
    useAssistantUtils();

  const { attachment, setAttachment, handleImageUpload, clearAttachment } =
    useImageAttachment();

  const [updateAssistant, setUpdateAssistant] = useState<
    TCustomAssistant | undefined
  >(assistant);

  const formik = useFormik<Omit<TCustomAssistant, "key">>({
    initialValues: {
      description: updateAssistant?.description || "",
      name: updateAssistant?.name || "",
      systemPrompt: updateAssistant?.systemPrompt || "",
      iconURL: updateAssistant?.iconURL || "",
      startMessage: updateAssistant?.startMessage || [],
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      if (updateAssistant?.key) {
        updateAssistantMutation.mutate(
          {
            key: updateAssistant.key,
            assistant: values as TCustomAssistant,
          },
          {
            onSettled: () => {
              onOpenChange(false);
              setUpdateAssistant(undefined);
            },
          },
        );
      } else {
        createAssistantMutation.mutate(
          { ...values, key: generateShortUUID() },
          {
            onSuccess(data, variables, context) {
              onOpenChange(false);
              clearAssistant();
            },
            onError: (error) => {
              // Log this error
              console.error(error);
            },
          },
        );
      }
    },
  });

  useEffect(() => {
    botTitleRef?.current?.focus();
  }, [open]);

  useEffect(() => {
    setAttachment({
      base64: updateAssistant?.iconURL ?? undefined,
    });
  }, [updateAssistant]);

  useEffect(() => {
    if (attachment) {
      formik.setFieldValue("iconURL", attachment.base64);
    }
  }, [attachment]);

  const clearAssistant = () => {
    formik.resetForm();
  };

  const handleClearAttachment = () => {
    clearAttachment();
    formik.setFieldValue("iconURL", "");
  };

  const handleCancel = () => {
    clearAssistant();
    onOpenChange(false);
  };

  const handleAddStartMessage = () => {
    formik.setFieldValue("startMessage", [
      ...(formik.values.startMessage || []),
      "",
    ]);
  };

  const handleRemoveStartMessage = (index: number) => {
    const newStartMessages = formik.values.startMessage?.filter(
      (_, i) => i !== index,
    );
    formik.setFieldValue("startMessage", newStartMessages);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 z-[600] bg-zinc-500/50 dark:bg-zinc-900/50" />
      <DialogContent
        ariaTitle="Create Assistant"
        onInteractOutside={(e) => e.preventDefault()}
        className="no-scrollbar z-[605] mx-auto max-h-[550px] w-full max-w-[540px] overflow-y-auto rounded-2xl bg-white p-5 dark:bg-zinc-800"
      >
        <h2 className="w-full border-b border-zinc-500/15 pb-4 text-base font-medium">
          {updateAssistant?.key ? "Edit Assistant" : "Create Assistant"}
        </h2>
        <div className="space-y-4 overflow-y-auto">
          <Flex direction="col" gap="sm">
            <FormLabel label="Assistant Name" />
            <Input
              name="name"
              placeholder="Assistant Name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
          </Flex>

          <Flex direction="col" gap="sm">
            <FormLabel label="Description" isOptional />
            <Input
              name="description"
              placeholder="Description"
              value={formik.values.description || ""}
              onChange={formik.handleChange}
            />
          </Flex>

          <Flex direction="col" gap="sm">
            <FormLabel label="Avatar" isOptional />
            <Flex direction="row" gap="sm" items="center">
              <ImageAttachment
                attachment={attachment}
                clearAttachment={handleClearAttachment}
              />
              <ImageUpload
                showIcon={false}
                tooltip="Upload Avatar"
                label="Upload"
                handleImageUpload={handleImageUpload}
                id="assistant-icon-upload"
              />
            </Flex>
          </Flex>

          <Flex direction="col" gap="sm">
            <FormLabel label="System Prompt">
              This will instruct the assistant on how to respond to user, how to
              behave, and how to answer questions.
            </FormLabel>
            <Textarea
              name="systemPrompt"
              placeholder="You're a helpful Assistant. Your role is to help users with their queries."
              value={formik.values.systemPrompt}
              onChange={formik.handleChange}
            />
          </Flex>

          <Flex direction="col" gap="sm">
            <FormLabel label="Start Messages" isOptional>
              Starter messages to get started conversation with the assistant.
            </FormLabel>
            {formik.values.startMessage?.map((message, index) => (
              <Flex
                key={index}
                direction="row"
                gap="sm"
                items="center"
                className="w-full"
              >
                <Input
                  name={`startMessage.${index}`}
                  placeholder={`Start message ${index + 1}`}
                  value={message}
                  className="flex-1"
                  onChange={formik.handleChange}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveStartMessage(index)}
                >
                  <Trash size={16} />
                </Button>
              </Flex>
            ))}
            <Button
              variant="bordered"
              size="sm"
              onClick={handleAddStartMessage}
              className="self-start"
            >
              <Plus size={16} />
              Add Start Message
            </Button>
          </Flex>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="default" onClick={() => formik.handleSubmit()}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

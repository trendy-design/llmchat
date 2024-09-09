import { useAssistantUtils, useImageAttachment } from "@/lib/hooks";
import { TAssistant } from "@/lib/types";
import {
  Badge,
  Button,
  ComingSoon,
  Flex,
  FormLabel,
  Input,
  Textarea,
} from "@/ui";
import { useFormik } from "formik";
import { Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { ImageAttachment } from "../chat-input/image-attachment";
import { ImageUpload } from "../chat-input/image-upload";
import { ModelSelect } from "../model-select";

export type TCreateAssistant = {
  assistant?: TAssistant;
  onCreateAssistant: (assistant: Omit<TAssistant, "key">) => void;
  onUpdateAssistant: (assistant: TAssistant) => void;
  onCancel: () => void;
};

export const CreateAssistant = ({
  assistant,
  onCreateAssistant,
  onUpdateAssistant,
  onCancel,
}: TCreateAssistant) => {
  const botTitleRef = useRef<HTMLInputElement | null>(null);
  const { assistants } = useAssistantUtils();

  const { attachment, setAttachment, handleImageUpload, clearAttachment } =
    useImageAttachment();

  const formik = useFormik<Omit<TAssistant, "key" | "provider" | "id">>({
    initialValues: {
      description: assistant?.description || "",
      name: assistant?.name || "",
      systemPrompt: assistant?.systemPrompt || "",
      iconURL: assistant?.iconURL || "",
      baseModel: assistant?.baseModel || "gpt-3.5-turbo",
      type: "custom",
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      if (assistant?.key) {
        const selectedAssistant = assistants.find(
          (a) => a.baseModel === assistant?.baseModel,
        );

        selectedAssistant?.provider &&
          onUpdateAssistant({
            ...values,
            key: assistant?.key,
            provider: selectedAssistant?.provider,
          });
      } else {
        const selectedAssistant = assistants.find(
          (a) => a.baseModel === values?.baseModel,
        );
        selectedAssistant?.provider &&
          onCreateAssistant({
            ...values,
            provider: selectedAssistant?.provider,
          });
      }
      clearAssistant();
      onCancel();
    },
  });

  useEffect(() => {
    botTitleRef?.current?.focus();
  }, [open]);

  useEffect(() => {
    setAttachment({
      base64: assistant?.iconURL ?? undefined,
    });
  }, [assistant]);

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

  return (
    <div className="relative flex h-full w-full flex-col items-start overflow-hidden rounded-lg bg-white dark:border dark:border-white/10 dark:bg-zinc-800">
      <div className="flex w-full flex-row items-center gap-3 border-b border-zinc-500/20 px-4 py-3">
        <p className="text-base font-medium">
          {assistant?.key ? "Edit Assistant" : "Add New Assistant"}
        </p>
        <Badge>Beta</Badge>
      </div>
      <div className="no-scrollbar flex h-full w-full flex-col items-start gap-6 overflow-y-auto p-4 pb-[100px]">
        <div className="flex w-full flex-row items-center justify-between gap-2">
          <FormLabel label="Base Model" />
          <ModelSelect
            variant="secondary"
            fullWidth
            className="h-10 w-full justify-start p-2"
            selectedModel={formik.values.baseModel}
            setSelectedModel={(model) => {
              formik.setFieldValue("baseModel", model);
            }}
          />
        </div>

        <div className="flex w-full flex-col gap-2">
          <FormLabel label="Assistant Name" />
          <Input
            type="text"
            name="name"
            placeholder="Assistant Name"
            value={formik.values.name}
            ref={botTitleRef}
            onChange={formik.handleChange}
            className="w-full"
          />
        </div>

        <Flex direction="col" gap="sm">
          <FormLabel label="Icon" isOptional />
          <Flex direction="row" gap="sm" items="center">
            <ImageAttachment
              attachment={attachment}
              clearAttachment={handleClearAttachment}
            />
            <ImageUpload
              label="Upload Icon"
              handleImageUpload={handleImageUpload}
              id="assistant-icon-upload"
              tooltip="Upload Icon"
              showIcon={false}
            />
          </Flex>
        </Flex>

        <div className="flex w-full flex-col gap-2">
          <FormLabel label="System Prompt">
            Assign bot a role to help users understand what the bot can do.
          </FormLabel>
          <Textarea
            name="systemPrompt"
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            placeholder="You're a helpful Assistant. Your role is to help users with their queries."
            value={formik.values.systemPrompt}
            onChange={formik.handleChange}
            className="w-full"
          />
        </div>
        <div className="flex w-full flex-col gap-2">
          <FormLabel label="Knowledge">
            Provide custom knowledge that your bot will access to inform its
            responses. Your bot will retrieve relevant sections from the
            knowledge base based on the user message. The data in the knowledge
            base may be made viewable by other users through bot responses or
            citations.
          </FormLabel>
          <Button variant="default" disabled={true} className="opacity-20">
            <Plus size={20} strokeWidth={2} /> Add Knowledge <ComingSoon />
          </Button>
        </div>
      </div>
      <div className="flex w-full flex-row items-center justify-between gap-1 border-t border-zinc-500/20 p-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={() => {
            formik.handleSubmit();
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

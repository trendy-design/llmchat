import { TBot } from "@/hooks/use-bots";
import { convertFileToBase64 } from "@/lib/helper";
import { ArrowLeft, Plus } from "@phosphor-icons/react";
import { useFormik } from "formik";
import { useEffect, useRef } from "react";
import { ModelSelect } from "../model-select";
import { Badge } from "../ui/badge";
import { BotAvatar } from "../ui/bot-avatar";
import { Button } from "../ui/button";
import { ComingSoon } from "../ui/coming-soon";
import { FormLabel } from "../ui/form-label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export type TCreateBot = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBot: (bot: Omit<TBot, "id">) => void;
};

export const CreateBot = ({ open, onOpenChange, onCreateBot }: TCreateBot) => {
  const botTitleRef = useRef<HTMLInputElement | null>(null);

  const formik = useFormik<Omit<TBot, "id">>({
    initialValues: {
      name: "",
      description: "",
      prompt: "",
      avatar: undefined,
      status: undefined,
      deafultBaseModel: "gemini-pro",
    },
    onSubmit: (values) => {
      onCreateBot(values);
      clearBot();
      onOpenChange(false);
    },
  });

  useEffect(() => {
    botTitleRef?.current?.focus();
  }, [open]);

  const clearBot = () => {
    formik.resetForm();
  };

  const uploadFile = (file: File) => {
    convertFileToBase64(file, (base64) => {
      formik.setFieldValue("avatar", base64);
    });
  };
  return (
    <div className="flex flex-col items-start w-full relative h-full overflow-hidden">
      <div className="w-full px-2 py-2 border-b border-zinc-500/20 flex flex-row gap-3 items-center">
        <Button
          size="iconSm"
          variant="ghost"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          <ArrowLeft size={16} weight="bold" />
        </Button>
        <p className="text-base font-medium">Create New Bot</p>
        <Badge>Beta</Badge>
      </div>
      <div className="flex flex-col w-full p-4 gap-8 items-start h-full overflow-y-auto no-scrollbar pb-[100px]">
        <div className="flex flex-col gap-2 w-full">
          <FormLabel label="Base Model" />
          <ModelSelect
            variant="secondary"
            fullWidth
            className="w-full justify-start p-2 h-10"
            selectedModel={formik.values.deafultBaseModel}
            setSelectedModel={(model) => {
              formik.setFieldValue("deafultBaseModel", model);
            }}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <FormLabel label="Bot Avatar" />

          <div className="flex flex-row justify-start items-center gap-2 w-full">
            <BotAvatar
              name={formik.values.name}
              size="large"
              avatar={formik.values.avatar}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                document.getElementById("avatar")?.click();
              }}
            >
              Upload Avatar
            </Button>
            <input
              type="file"
              id="avatar"
              hidden
              onChange={(e) => {
                e.target.files?.[0] && uploadFile(e.target.files?.[0]);
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <FormLabel label="Bot Name" />
          <Input
            type="text"
            name="name"
            placeholder="Bot Title"
            value={formik.values.name}
            ref={botTitleRef}
            onChange={formik.handleChange}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <FormLabel label="Bot Bio">
            A short description of your bot. This will be displayed in the bot
          </FormLabel>
          <Textarea
            name="description"
            placeholder="This is a bot that can help you with anything."
            value={formik.values.description}
            onChange={formik.handleChange}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <FormLabel label="Knowledge">
            Provide custom knowledge that your bot will access to inform its
            responses. Your bot will retrieve relevant sections from the
            knowledge base based on the user message. The data in the knowledge
            base may be made viewable by other users through bot responses or
            citations.
          </FormLabel>
          <Button variant="default" disabled={true} className="opacity-20">
            <Plus size={20} weight="bold" /> Add Knowledge <ComingSoon />
          </Button>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <FormLabel label="Greeting Message">
            The bot will send this message at the beginning of every
            conversation.
          </FormLabel>
          <Textarea
            name="greetingMessage"
            placeholder="Hello I'm a bot! Ask me anything."
            value={formik.values.greetingMessage}
            onChange={formik.handleChange}
            className="w-full h-12"
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <FormLabel label="System Prompt">
            Assign bot a role to help users understand what the bot can do.
          </FormLabel>
          <Textarea
            name="prompt"
            placeholder="You're a helpful Assistant. Your role is to help users with their queries."
            value={formik.values.prompt}
            onChange={formik.handleChange}
            className="w-full"
          />
        </div>
      </div>
      <div className="w-full absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-800  px-2 py-2 border-t border-zinc-500/20 flex flex-row gap-3 items-center">
        <Button
          variant="default"
          onClick={() => {
            formik.handleSubmit();
          }}
        >
          Save
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          Cancel
        </Button>
        <div className="flex-1"></div>

        <Button
          size="sm"
          variant="default"
          disabled={true}
          className="opacity-20"
        >
          Publish <ComingSoon />
        </Button>
      </div>
    </div>
  );
};

import { defaultPreferences } from "@/config/preferences";
import {
  useAssistants,
  useChatContext,
  usePreferenceContext,
  usePromptsContext,
} from "@/lib/context";
import { useAssistantUtils } from "@/lib/hooks";
import { TAssistant } from "@/lib/types";
import { cn } from "@/lib/utils/clsx";
import { Button, Flex } from "@/ui";
import { ArrowUp, Book } from "lucide-react";
import { useEffect, useState } from "react";
import { PluginSelect } from "../plugin-select";
import { ImageUpload } from "./image-upload";

export type TChatActions = {
  sendMessage: (message: string) => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const ChatActions = ({
  sendMessage,
  handleImageUpload,
}: TChatActions) => {
  const { store } = useChatContext();
  const isGenerating = store((state) => state.isGenerating);
  const editor = store((state) => state.editor);
  const { preferences, updatePreferences } = usePreferenceContext();
  const { selectedAssistant, open: openAssistants } = useAssistants();
  const { open: openPrompts } = usePromptsContext();
  const [selectedAssistantKey, setSelectedAssistantKey] = useState<
    TAssistant["key"]
  >(preferences.defaultAssistant);
  const { models, getAssistantByKey, getAssistantIcon } = useAssistantUtils();

  useEffect(() => {
    const assistantProps = getAssistantByKey(preferences.defaultAssistant);
    if (assistantProps?.model) {
      setSelectedAssistantKey(preferences.defaultAssistant);
    } else {
      updatePreferences({
        defaultAssistant: defaultPreferences.defaultAssistant,
      });
    }
  }, [models, preferences.defaultAssistant]);

  const assistantKey = selectedAssistant?.assistant.key;
  const assistantName = selectedAssistant?.assistant.name;
  const hasTextInput = !!editor?.getText();

  const sendButtonClasses = cn({
    "bg-teal-600/20 text-teal-600 dark:text-teal-400": hasTextInput,
  });
  return (
    <Flex
      className="w-full px-1 pb-1 pt-1 md:px-2 md:pb-2"
      items="center"
      justify="between"
    >
      <Flex gap="xs" items="center">
        <Button
          variant="ghost"
          onClick={openAssistants}
          className="gap-2 pl-1.5 pr-3 text-xs md:text-sm"
          size="sm"
        >
          {assistantKey && getAssistantIcon(assistantKey, "sm")}
          {assistantName}
        </Button>

        <PluginSelect selectedAssistantKey={selectedAssistantKey} />
        <ImageUpload
          id="image-upload"
          label="Upload Image"
          tooltip="Upload Image"
          showIcon
          handleImageUpload={handleImageUpload}
        />
      </Flex>

      <Flex gap="xs" items="center">
        <Button
          variant="ghost"
          onClick={() => {
            openPrompts();
          }}
          className="gap-2 pl-1.5 pr-3 text-xs md:text-sm"
          size="sm"
        >
          <Book size={16} strokeWidth="2" />
          <span className="hidden md:flex">Prompts</span>
        </Button>
        <Button
          size="iconSm"
          variant={hasTextInput ? "default" : "secondary"}
          disabled={!hasTextInput || isGenerating}
          className={sendButtonClasses}
          onClick={() => {
            editor?.getText() && sendMessage(editor?.getText());
          }}
        >
          <ArrowUp size={16} strokeWidth="2" />
        </Button>
      </Flex>
    </Flex>
  );
};

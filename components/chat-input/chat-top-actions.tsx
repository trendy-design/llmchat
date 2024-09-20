import { defaultPreferences } from "@/config/preferences";
import { usePreferenceContext } from "@/lib/context";
import { useAssistantUtils } from "@/lib/hooks";
import { TAssistant } from "@/lib/types";
import { useRootContext } from "@/libs/context/root";
import { Button, Flex } from "@/ui";
import { ChevronLeft, ChevronRight, Github } from "lucide-react";
import { useEffect, useState } from "react";
import { AssistantModal } from "../assistants/assistant-modal";
import { useFeedback } from "../feedback/use-feedback";
import { PluginSelect } from "../plugin-select";

export const ChatTopActions = () => {
  const { setOpen, renderModal } = useFeedback();
  const { preferences, updatePreferences } = usePreferenceContext();
  const [selectedAssistantKey, setSelectedAssistantKey] = useState<
    TAssistant["key"]
  >(preferences.defaultAssistant);
  const { models, getAssistantByKey } = useAssistantUtils();
  const { isSidebarOpen, setIsSidebarOpen } = useRootContext();

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

  return (
    <Flex
      className="w-full px-1 pb-2 pt-2 md:p-2"
      items="center"
      justify="between"
    >
      <Flex gap="xs" items="center">
        <Button
          variant="ghost"
          size="iconSm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <ChevronLeft size={16} strokeWidth={2} />
          ) : (
            <ChevronRight size={16} strokeWidth={2} />
          )}
        </Button>

        <AssistantModal
          selectedAssistantKey={selectedAssistantKey}
          onAssistantchange={setSelectedAssistantKey}
        />

        <PluginSelect selectedAssistantKey={selectedAssistantKey} />
      </Flex>
      <Flex gap="xs" items="center">
        <Button
          variant="bordered"
          size="sm"
          onClick={() => {
            window.open("https://git.new/llmchat", "_blank");
          }}
        >
          <Github size={16} />
          Star on Github
        </Button>
        <Button
          variant="bordered"
          size="sm"
          onClick={() => {
            setOpen(true);
          }}
        >
          Feedback
        </Button>
      </Flex>
      {renderModal()}
    </Flex>
  );
};

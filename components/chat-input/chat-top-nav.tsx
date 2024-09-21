import { defaultPreferences } from "@/config/preferences";
import { usePreferenceContext, useSessions } from "@/lib/context";
import { useAssistantUtils } from "@/lib/hooks";
import { TAssistant } from "@/lib/types";
import { useRootContext } from "@/libs/context/root";
import { Button, Flex } from "@/ui";
import { FlagIcon, PanelLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { AssistantModal } from "../assistants/assistant-modal";
import { useFeedback } from "../feedback/use-feedback";
import { PluginSelect } from "../plugin-select";

export const ChatTopNav = () => {
  const { setOpen, renderModal } = useFeedback();
  const { createSession } = useSessions();
  const { preferences, updatePreferences } = usePreferenceContext();
  const [selectedAssistantKey, setSelectedAssistantKey] = useState<
    TAssistant["key"]
  >(preferences.defaultAssistant);
  const { models, getAssistantByKey } = useAssistantUtils();
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useRootContext();

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
      className="absolute top-0 z-20 w-full rounded-t-md border-b border-zinc-500/10 bg-zinc-25 p-1 dark:bg-zinc-800 md:p-2"
      items="center"
      justify="between"
    >
      <Flex gap="xs" items="center">
        <Button
          variant="ghost"
          size="iconSm"
          className="flex lg:hidden"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        >
          <PanelLeft size={16} strokeWidth={2} />
        </Button>

        <Button
          variant="ghost"
          size="iconSm"
          className="hidden lg:flex"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <PanelLeft size={16} strokeWidth={2} />
        </Button>
        <Button
          variant="ghost"
          size="iconSm"
          className="flex lg:hidden"
          onClick={() => {
            createSession();
          }}
        >
          <Plus size={16} strokeWidth={2} />
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
          <FaGithub size={16} />
          <span className="hidden md:block">Star on Github</span>
        </Button>
        <Button
          variant="bordered"
          size="sm"
          onClick={() => {
            setOpen(true);
          }}
        >
          <FlagIcon size={16} className="block md:hidden" />
          <span className="hidden md:block">Feedback</span>
        </Button>
      </Flex>
      {renderModal()}
    </Flex>
  );
};

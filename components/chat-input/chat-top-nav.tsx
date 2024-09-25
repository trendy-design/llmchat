import { defaultPreferences } from "@/config/preferences";
import { usePreferenceContext, useSessions } from "@/lib/context";
import { useAssistantUtils } from "@/lib/hooks";
import { TAssistant } from "@/lib/types";
import { Button } from "@/ui";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AssistantModal } from "../assistants/assistant-modal";
import { TopNav } from "../layout/top-nav";
import { PluginSelect } from "../plugin-select";

export const ChatTopNav = () => {
  const { createSession } = useSessions();
  const { preferences, updatePreferences } = usePreferenceContext();
  const [selectedAssistantKey, setSelectedAssistantKey] = useState<
    TAssistant["key"]
  >(preferences.defaultAssistant);
  const { models, getAssistantByKey } = useAssistantUtils();

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
    <TopNav>
      <Button
        variant="ghost"
        size="icon-sm"
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
    </TopNav>
  );
};

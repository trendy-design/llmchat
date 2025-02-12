import { usePreferenceContext, useSessions } from "@/lib/context";
import { useAssistantUtils } from "@/lib/hooks";
import { defaultPreferences } from "@repo/shared/config";
import { TAssistant } from "@repo/shared/types";
import { Button } from "@repo/ui";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { TopNav } from "../layout/top-nav";

export const ChatTopNav = () => {
  const { createSession } = useSessions();
  const { preferences, updatePreferences } = usePreferenceContext();
  const [selectedAssistantKey, setSelectedAssistantKey] = useState<
    TAssistant["key"]
  >(preferences.defaultAssistant);
  const { models, getAssistantByKey } = useAssistantUtils();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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

      {/* <AssistantModal
        selectedAssistantKey={selectedAssistantKey}
        onAssistantchange={setSelectedAssistantKey}
      /> */}

      {/* <PluginSelect selectedAssistantKey={selectedAssistantKey} /> */}
    </TopNav>
  );
};

import { useChatSession } from "@/hooks/use-chat-session";
import { useRouter } from "next/navigation";
import { SettingsContainer } from "./settings-container";

export const Data = () => {
  const { push } = useRouter();
  const { clearSessions, createNewSession } = useChatSession();

  const clearAllData = async () => {
    clearSessions().then(() => {
      createNewSession().then((session) => {
        push(`/chat/${session?.id}`);
      });
    });
  };
  return (
    <SettingsContainer title="Manage your Data">
      <div></div>
    </SettingsContainer>
  );
};

import { useSettings } from "@/context/settings/context";
import { useChatSession } from "@/hooks/use-chat-session";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Flex } from "../ui/flex";
import { Type } from "../ui/text";
import { useToast } from "../ui/use-toast";
import { SettingCard } from "./setting-card";
import { SettingsContainer } from "./settings-container";

export const Data = () => {
  const { push } = useRouter();
  const { dismiss } = useSettings();
  const { toast } = useToast();
  const { clearSessions, createNewSession } = useChatSession();

  const clearAllData = async () => {
    toast({
      title: "Clear All Data?",
      description: "This action cannot be undone.",
      variant: "destructive",
      action: (
        <Button
          size="sm"
          variant="default"
          onClick={() => {
            clearSessions().then(() => {
              createNewSession().then((session) => {
                toast({
                  title: "Data Cleared",
                  description: "All chat data has been cleared",
                  variant: "default",
                });
                push(`/chat/${session?.id}`);
                dismiss();
              });
            });
          }}
        >
          Clear All
        </Button>
      ),
    });
  };
  return (
    <SettingsContainer title="Manage your Data">
      <Flex direction="col" gap="md" className="w-full">
        <SettingCard className="p-3">
          <Flex items="center" justify="between">
            <Type textColor="secondary">Clear all chat sessions</Type>
            <Button variant="destructive" size="sm" onClick={clearAllData}>
              Clear all
            </Button>
          </Flex>
          <div className="my-3 h-[1px] bg-zinc-500/10 w-full" />
          <Flex items="center" justify="between">
            <Type textColor="secondary">
              Delete all data and reset all settings
            </Type>
            <Button variant="destructive" size="sm" onClick={clearAllData}>
              Reset
            </Button>
          </Flex>
        </SettingCard>
      </Flex>
    </SettingsContainer>
  );
};

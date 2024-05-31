import { useSettings } from "@/context/settings/context";
import { useChatSession } from "@/hooks/use-chat-session";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
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
      <div className="flex flex-row items-end justify-between">
        <p className="text-sm md:text-base  text-zinc-500">
          Clear all chat data
        </p>
      </div>
      <Button variant="destructive" size="sm" onClick={clearAllData}>
        Clear All Data
      </Button>
    </SettingsContainer>
  );
};

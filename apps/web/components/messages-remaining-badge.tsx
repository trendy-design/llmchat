import { useChatStore } from "@/libs/store/chat.store";
import { IconBrandGithub } from "@tabler/icons-react";
import { SettingsModal } from "./settings-modal";

export function MessagesRemainingBadge() {
  const messageLimit = useChatStore(state => state.messageLimit);

  if (messageLimit.remaining > 5) {
    return (
      <div className="text-xs flex-row text-yellow-900/80 flex items-center gap-2">
        Local-first app - Your data stays on your device
        <a 
          href="https://github.com/your-repo" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-yellow-900/80 hover:text-yellow-900 underline flex flex-row items-center gap-1"
        >
         <IconBrandGithub size={16} strokeWidth={2} /> Check our GitHub
        </a>
      </div>
    );
  }

  return (
    <div className="text-xs text-yellow-900/80">
      You have {messageLimit.remaining} messages left today. <span className="text-yellow-900 font-medium cursor-pointer underline">Sign in</span> to get more messages or 
      
      <span className="text-yellow-900 font-medium pl-1 cursor-pointer underline">
        <SettingsModal>
                <span>
        Bring Your Own API Key
        </span>
        </SettingsModal>
        </span>
    </div>
  );
} 
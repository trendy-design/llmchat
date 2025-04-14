import { useUser } from '@clerk/nextjs';
import { useApiKeysStore, useAppStore, useChatStore } from '@repo/common/store';
import { motion } from 'framer-motion';

export function MessagesRemainingBadge() {
    const { user } = useUser();
    const chatMode = useChatStore(state => state.chatMode);
    const hasApiKeys = useApiKeysStore(state => state.hasApiKeyForChatMode(chatMode));
    const creditLimit = useChatStore(state => state.creditLimit);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const setSettingTab = useAppStore(state => state.setSettingTab);

    if (
        !creditLimit.isFetched ||
        !user ||
        (creditLimit?.remaining && creditLimit?.remaining > 5) ||
        hasApiKeys
    ) {
        return null;
    }

    return (
        <div className="relative flex w-full items-center justify-center px-3">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="border-border bg-tertiary/70 -mt-2 flex h-10  w-full flex-row items-center gap-2 rounded-b-xl border-x border-b px-3 pt-2 font-medium"
            >
                <div className="text-muted-foreground/50 text-xs">
                    {creditLimit.remaining === 0
                        ? 'You have no credits left today.'
                        : `You have ${creditLimit.remaining} credits left today.`}{' '}
                    For continuous use,
                    <span
                        className="inline-flex shrink-0 cursor-pointer flex-row items-center gap-1 pl-1 font-medium "
                        onClick={() => {
                            setIsSettingsOpen(true);
                            setSettingTab('api-keys');
                        }}
                    >
                        <span className="text-muted-foreground inline-flex flex-row items-center gap-1 px-1 underline underline-offset-2">
                            Add your own API key
                        </span>
                    </span>
                </div>
            </motion.div>
        </div>
    );
}

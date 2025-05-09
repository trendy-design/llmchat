import { useUser } from '@clerk/nextjs';
import { useApiKeysStore, useAppStore, useChatStore } from '@repo/common/store';
import { Button } from '@repo/ui/src/components/button';
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
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className=" bg-quaternary relative -mb-4 flex h-12 w-full flex-row items-center justify-center gap-2 rounded-t-xl pb-4 pl-3 pr-1 font-medium"
        >
            <div className="text-muted-foreground/50 flex flex-1 flex-row items-center gap-2 text-xs">
                <span className="inline-flex flex-row items-center gap-1">
                    {creditLimit.remaining === 0
                        ? 'You have no credits left today.'
                        : `You have ${creditLimit.remaining} credits left today.`}{' '}
                    For continuous use
                </span>
                <div className="flex-1" />
                <Button
                    variant="bordered"
                    size="xxs"
                    onClick={() => {
                        setIsSettingsOpen(true);
                        setSettingTab('api-keys');
                    }}
                >
                    Add your own API key
                </Button>
            </div>
        </motion.div>
    );
}

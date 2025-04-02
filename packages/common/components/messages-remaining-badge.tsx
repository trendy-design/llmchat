import { useUser } from '@clerk/nextjs';
import { useApiKeysStore, useAppStore, useChatStore } from '@repo/common/store';
import { motion } from 'framer-motion';
import { BYOKIcon } from './icons';

export function MessagesRemainingBadge() {
    const { user } = useUser();
    const chatMode = useChatStore(state => state.chatMode);
    const hasApiKeys = useApiKeysStore(state => state.hasApiKeyForChatMode(chatMode));
    const creditLimit = useChatStore(state => state.creditLimit);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const setSettingTab = useAppStore(state => state.setSettingTab);

    if (!creditLimit.isFetched || !user || creditLimit?.remaining > 5 || hasApiKeys) {
        return null;
    }

    return (
        <div className="relative flex w-full items-center justify-center py-2">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="border-hard bg-background absolute bottom-2 mx-auto  flex h-8 flex-row items-center gap-2 rounded-xl border px-3 font-medium shadow-md"
            >
                <div className="text-muted-foreground text-xs">
                    {creditLimit.remaining === 0
                        ? 'You have no credits left today.'
                        : `You have ${creditLimit.remaining} credits left today.`}{' '}
                    For continuous use,
                    <span
                        className="inline-flex shrink-0 cursor-pointer flex-row items-center gap-1 pl-1 font-medium text-emerald-600 "
                        onClick={() => {
                            setIsSettingsOpen(true);
                            setSettingTab('api-keys');
                        }}
                    >
                        <span className="underline">Add your own API key</span> <BYOKIcon />
                    </span>
                </div>
            </motion.div>
        </div>
    );
}

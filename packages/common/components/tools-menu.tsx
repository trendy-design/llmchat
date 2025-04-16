import { useMcpToolsStore } from '@repo/common/store';
import { Button } from '@repo/ui/src/components/button';

import { Badge } from '@repo/ui';

import { IconTools } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useApiKeysStore } from '../store/api-keys.store';
import { useAppStore } from '../store/app.store';
import { useChatStore } from '../store/chat.store';

export const ToolsMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { mcpConfig, updateSelectedMCP, selectedMCP } = useMcpToolsStore();
    const apiKeys = useApiKeysStore();
    const chatMode = useChatStore(state => state.chatMode);
    const hasApiKeyForChatMode = useApiKeysStore(state => state.hasApiKeyForChatMode);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const setSettingTab = useAppStore(state => state.setSettingTab);
    const isToolsAvailable = useMemo(
        () => hasApiKeyForChatMode(chatMode),
        [chatMode, hasApiKeyForChatMode, apiKeys]
    );

    const selectedMCPTools = useMemo(() => {
        return Object.keys(mcpConfig).filter(key => mcpConfig[key]);
    }, [mcpConfig]);

    return (
        <Button
            size={'xs'}
            tooltip={isToolsAvailable ? 'Tools' : 'Only available with BYOK'}
            variant={isOpen ? 'secondary' : 'ghost'}
            className="gap-2"
            onClick={() => {
                if (!isToolsAvailable) {
                    setIsSettingsOpen(true);
                    setSettingTab('mcp-tools');
                }
            }}
        >
            <IconTools size={14} strokeWidth={2} className="text-muted-foreground" />
            {selectedMCPTools?.length > 0 && (
                <Badge
                    variant="secondary"
                    className=" flex h-4 min-w-4 items-center justify-center rounded-sm px-1.5 text-xs"
                >
                    {selectedMCPTools.length}
                </Badge>
            )}
        </Button>
    );
};

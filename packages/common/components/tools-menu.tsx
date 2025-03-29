import { IconPlus } from '@tabler/icons-react';

import { Button } from '@repo/ui/src/components/button';
import { useMcpToolsStore } from '../store/mcp-tools.store';

import {
    Badge,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@repo/ui';

import { IconCheck, IconTools } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useApiKeysStore } from '../store/api-keys.store';
import { SETTING_TABS, useAppStore } from '../store/app.store';
import { useChatStore } from '../store/chat.store';
import { ToolIcon } from './icons';

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
        <>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        size={selectedMCP.length > 0 ? 'sm' : 'icon'}
                        tooltip={isToolsAvailable ? 'Tools' : 'Only available with BYOK'}
                        variant={isOpen ? 'secondary' : 'ghost'}
                        className="gap-2"
                        rounded="full"
                        disabled={!isToolsAvailable}
                    >
                        <IconTools size={18} strokeWidth={2} className="text-muted-foreground" />
                        {selectedMCPTools?.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="bor flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs"
                            >
                                {selectedMCPTools.length}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="bottom" className="w-[320px]">
                    {Object.keys(mcpConfig).map(key => (
                        <DropdownMenuItem
                            key={key}
                            onClick={() =>
                                updateSelectedMCP(prev => {
                                    if (prev.includes(key)) {
                                        return prev.filter(mcp => mcp !== key);
                                    }
                                    return [...prev, key];
                                })
                            }
                        >
                            <div className="flex w-full items-center justify-between gap-2">
                                <ToolIcon />
                                <span>{key}</span>
                                <div className="flex-1" />
                                {selectedMCP.includes(key) && (
                                    <IconCheck size={16} className="text-foreground" />
                                )}
                            </div>
                        </DropdownMenuItem>
                    ))}
                    {mcpConfig && Object.keys(mcpConfig).length === 0 && (
                        <div className="flex h-[150px] flex-col items-center justify-center gap-2">
                            <IconTools
                                size={16}
                                strokeWidth={2}
                                className="text-muted-foreground"
                            />
                            <p className="text-muted-foreground text-sm">No tools found</p>
                            <Button
                                rounded="full"
                                variant="bordered"
                                className="text-muted-foreground text-xs"
                                onClick={() => {
                                    setIsSettingsOpen(true);
                                    setSettingTab(SETTING_TABS.MCP_TOOLS);
                                }}
                            >
                                <IconPlus
                                    size={14}
                                    strokeWidth={2}
                                    className="text-muted-foreground"
                                />
                                Add Tool
                            </Button>
                        </div>
                    )}
                    {mcpConfig && Object.keys(mcpConfig).length > 0 && <DropdownMenuSeparator />}
                    {mcpConfig && Object.keys(mcpConfig).length > 0 && (
                        <DropdownMenuItem
                            onClick={() => {
                                setIsSettingsOpen(true);
                                setSettingTab(SETTING_TABS.MCP_TOOLS);
                            }}
                        >
                            <IconPlus size={14} strokeWidth={2} className="text-muted-foreground" />
                            Add Tool
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

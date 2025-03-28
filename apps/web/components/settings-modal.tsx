'use client';
import { DialogFooter } from '@repo/ui';
import { IconBoltFilled, IconKey, IconTrash } from '@tabler/icons-react';

import { useMcpToolsStore } from '@/libs/store/mcp-tools.store';
import { Button } from '@repo/ui/src/components/button';

import { Badge, Dialog, DialogContent, Input } from '@repo/ui';

import { ApiKeys, useApiKeysStore } from '@/libs/store/api-keys.store';
import { SETTING_TABS, useAppStore } from '@/libs/store/app.store';
import { useChatStore } from '@/libs/store/chat.store';
import moment from 'moment';
import { useState } from 'react';
import { BYOKIcon, ToolIcon } from './icons';

export const SettingsModal = () => {
    const isSettingOpen = useAppStore(state => state.isSettingsOpen);
    const setIsSettingOpen = useAppStore(state => state.setIsSettingsOpen);
    const settingTab = useAppStore(state => state.settingTab);
    const setSettingTab = useAppStore(state => state.setSettingTab);

    const settingMenu = [
        {
            icon: <IconBoltFilled size={14} strokeWidth={2} className="text-muted-foreground" />,
            title: 'Usage',
            key: SETTING_TABS.CREDITS,
            component: <CreditsSettings />,
        },
        {
            icon: <IconKey size={14} strokeWidth={2} className="text-muted-foreground" />,
            title: 'API Keys',
            key: SETTING_TABS.API_KEYS,
            component: <ApiKeySettings />,
        },
        // {
        //     title: 'MCP Tools',
        //     key: SETTING_TABS.MCP_TOOLS,
        //     component: <MCPSettings />,
        // },
    ];

    return (
        <Dialog open={isSettingOpen} onOpenChange={() => setIsSettingOpen(false)}>
            <DialogContent
                ariaTitle="Settings"
                className="h-full max-h-[600px] !max-w-[700px] overflow-x-hidden rounded-xl p-0"
            >
                <div className="no-scrollbar relative max-w-full overflow-y-auto overflow-x-hidden">
                    <h3 className="border-border mx-5 border-b py-4 text-lg font-bold">Settings</h3>
                    <div className="flex flex-row gap-6 p-4">
                        <div className="flex w-[160px] shrink-0 flex-col gap-1">
                            {settingMenu.map(setting => (
                                <Button
                                    key={setting.key}
                                    rounded="full"
                                    className="justify-start"
                                    variant={settingTab === setting.key ? 'secondary' : 'ghost'}
                                    onClick={() => setSettingTab(setting.key)}
                                >
                                    {setting.icon}
                                    {setting.title}
                                </Button>
                            ))}
                        </div>
                        <div className="flex flex-1 flex-col overflow-hidden px-4">
                            {settingMenu.find(setting => setting.key === settingTab)?.component}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const MCPSettings = () => {
    const [isAddToolDialogOpen, setIsAddToolDialogOpen] = useState(false);
    const { mcpConfig, addMcpConfig, removeMcpConfig, updateSelectedMCP, selectedMCP } =
        useMcpToolsStore();

    return (
        <div className="flex w-full flex-col gap-6 overflow-x-hidden">
            <div className="flex flex-col">
                <h2 className="flex items-center gap-1 text-base font-medium">MCP Tools</h2>
                <p className="text-muted-foreground text-xs">
                    Connect your MCP tools. This will only work with your own API keys.
                </p>
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-muted-foreground text-xs font-medium">
                    Connected Tools{' '}
                    <Badge
                        variant="secondary"
                        className="inline-flex items-center gap-1 rounded-full bg-transparent text-emerald-600"
                    >
                        <span className="inline-block size-2 rounded-full bg-emerald-600"></span>
                        {mcpConfig && Object.keys(mcpConfig).length} Connected
                    </Badge>
                </p>
                {mcpConfig &&
                    Object.keys(mcpConfig).length > 0 &&
                    Object.keys(mcpConfig).map(key => (
                        <div
                            key={key}
                            className="bg-secondary divide-border border-border flex h-12 w-full flex-1 flex-row items-center gap-2 divide-x-2 rounded-lg border px-2.5 py-2"
                        >
                            <div className="flex w-full flex-row items-center gap-2">
                                <ToolIcon /> <Badge>{key}</Badge>
                                <p className="text-muted-foreground line-clamp-1 flex-1 text-sm">
                                    {mcpConfig[key]}
                                </p>
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    tooltip="Delete Tool"
                                    onClick={() => {
                                        removeMcpConfig(key);
                                    }}
                                >
                                    <IconTrash
                                        size={14}
                                        strokeWidth={2}
                                        className="text-muted-foreground"
                                    />
                                </Button>
                            </div>
                        </div>
                    ))}

                <Button
                    size="sm"
                    rounded="full"
                    className="mt-2 self-start"
                    onClick={() => setIsAddToolDialogOpen(true)}
                >
                    Add Tool
                </Button>
            </div>

            <div className="mt-6 border-t border-dashed pt-6">
                <p className="text-muted-foreground text-xs">Learn more about MCP:</p>
                <div className="mt-2 flex flex-col gap-2 text-sm">
                    <a
                        href="https://mcp.composio.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary inline-flex items-center hover:underline"
                    >
                        Browse Composio MCP Directory →
                    </a>
                    <a
                        href="https://www.anthropic.com/news/model-context-protocol"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary inline-flex items-center hover:underline"
                    >
                        Read MCP Documentation →
                    </a>
                </div>
            </div>

            <AddToolDialog
                isOpen={isAddToolDialogOpen}
                onOpenChange={setIsAddToolDialogOpen}
                onAddTool={addMcpConfig}
            />
        </div>
    );
};

type AddToolDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onAddTool: (tool: Record<string, string>) => void;
};

const AddToolDialog = ({ isOpen, onOpenChange, onAddTool }: AddToolDialogProps) => {
    const [mcpToolName, setMcpToolName] = useState('');
    const [mcpToolUrl, setMcpToolUrl] = useState('');
    const [error, setError] = useState('');
    const { mcpConfig } = useMcpToolsStore();

    const handleAddTool = () => {
        // Validate inputs
        if (!mcpToolName.trim()) {
            setError('Tool name is required');
            return;
        }

        if (!mcpToolUrl.trim()) {
            setError('Tool URL is required');
            return;
        }

        // Check for duplicate names
        if (mcpConfig && mcpConfig[mcpToolName]) {
            setError('A tool with this name already exists');
            return;
        }

        // Clear error if any
        setError('');

        console.log(mcpToolName, mcpToolUrl);

        // Add the tool
        onAddTool({
            [mcpToolName]: mcpToolUrl,
        });

        // Reset form and close dialog
        setMcpToolName('');
        setMcpToolUrl('');
        onOpenChange(false);
    };

    // Reset error when dialog opens/closes
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setError('');
            setMcpToolName('');
            setMcpToolUrl('');
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent ariaTitle="Add MCP Tool" className="!max-w-md">
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold">Add New MCP Tool</h3>

                    {error && <p className="text-destructive text-sm font-medium">{error}</p>}

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Tool Name</label>
                        <Input
                            placeholder="Tool Name"
                            value={mcpToolName}
                            onChange={e => {
                                const key = e.target.value?.trim().toLowerCase().replace(/ /g, '-');
                                setMcpToolName(key);
                                // Clear error when user types
                                if (error) setError('');
                            }}
                        />
                        <p className="text-muted-foreground text-xs">
                            Will be automatically converted to lowercase with hyphens
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Tool Server URL</label>
                        <Input
                            placeholder="https://your-mcp-server.com"
                            value={mcpToolUrl}
                            onChange={e => {
                                setMcpToolUrl(e.target.value);
                                // Clear error when user types
                                if (error) setError('');
                            }}
                        />
                        <p className="text-muted-foreground text-xs">
                            Example: https://your-mcp-server.com
                        </p>
                    </div>
                </div>
                <DialogFooter className="border-border mt-4 border-t pt-4">
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="bordered"
                            rounded={'full'}
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddTool} rounded="full">
                            Add Tool
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const ApiKeySettings = () => {
    const apiKeys = useApiKeysStore(state => state.getAllKeys());
    const setApiKey = useApiKeysStore(state => state.setKey);
    const [isEditing, setIsEditing] = useState<string | null>(null);

    const apiKeyList = [
        {
            name: 'OpenAI',
            key: 'OPENAI_API_KEY' as keyof ApiKeys,
            value: apiKeys.OPENAI_API_KEY,
            url: 'https://platform.openai.com/api-keys',
        },
        {
            name: 'Anthropic',
            key: 'ANTHROPIC_API_KEY' as keyof ApiKeys,
            value: apiKeys.ANTHROPIC_API_KEY,
            url: 'https://console.anthropic.com/settings/keys',
        },
        {
            name: 'Google Gemini',
            key: 'GEMINI_API_KEY' as keyof ApiKeys,
            value: apiKeys.GEMINI_API_KEY,
            url: 'https://ai.google.dev/api',
        },
    ];

    const validateApiKey = (apiKey: string, provider: string) => {
        // Validation logic will be implemented later
        console.log(`Validating ${provider} API key: ${apiKey}`);
        return true;
    };

    const handleSave = (keyName: keyof ApiKeys, value: string) => {
        setApiKey(keyName, value);
        setIsEditing(null);
    };

    const getMaskedKey = (key: string) => {
        if (!key) return '';
        return '****************' + key.slice(-4);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col">
                <h2 className="flex items-center gap-1 text-base font-medium">
                    API Keys <BYOKIcon />
                </h2>

                <p className="text-muted-foreground text-xs">
                    By default, your API Key is stored locally on your browser and never sent
                    anywhere else.
                </p>
            </div>

            {apiKeyList.map(apiKey => (
                <div key={apiKey.key} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{apiKey.name} API Key:</span>
                        <a
                            href={apiKey.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-yellow-700 underline-offset-2 hover:underline"
                        >
                            (Get API key here)
                        </a>
                    </div>

                    <div className="flex items-center gap-2">
                        {isEditing === apiKey.key ? (
                            <>
                                <div className="flex-1">
                                    <Input
                                        value={apiKey.value || ''}
                                        placeholder={`Enter ${apiKey.name} API key`}
                                        onChange={e => setApiKey(apiKey.key, e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    rounded="full"
                                    onClick={() => handleSave(apiKey.key, apiKey.value || '')}
                                >
                                    <span className="flex items-center gap-1">✓ Save</span>
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-1 items-center gap-2 rounded-md border px-3 py-1.5">
                                    {apiKey.value ? (
                                        <span className="flex-1">{getMaskedKey(apiKey.value)}</span>
                                    ) : (
                                        <span className="text-muted-foreground flex-1 text-sm">
                                            No API key set
                                        </span>
                                    )}
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    rounded="full"
                                    onClick={() => setIsEditing(apiKey.key)}
                                >
                                    {apiKey.value ? 'Change Key' : 'Add Key'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export const CreditsSettings = () => {
    const remainingCredits = useChatStore(state => state.creditLimit.remaining);
    const maxLimit = useChatStore(state => state.creditLimit.maxLimit);
    const resetDate = useChatStore(state => state.creditLimit.reset);

    const info = [
        {
            title: 'Plan',
            value: (
                <Badge
                    variant="secondary"
                    className="rounded-full bg-emerald-600/10 text-emerald-600"
                >
                    <span className="text-xs font-medium">FREE</span>
                </Badge>
            ),
        },
        {
            title: 'Credits',
            value: (
                <div className="flex h-7 flex-row items-center gap-1 rounded-full py-1">
                    <IconBoltFilled size={14} strokeWidth={2} className="text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">{remainingCredits}</span>
                    <span className="text-sm text-yellow-800 opacity-50">/</span>
                    <span className="text-sm text-yellow-800 opacity-50">{maxLimit}</span>
                </div>
            ),
        },
        {
            title: 'Next reset',
            value: moment(resetDate).fromNow(),
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-start gap-2">
                <h2 className="flex items-center gap-1 text-base font-medium">Usage Credits</h2>

                <div className="divide-border flex w-full flex-col gap-1 divide-y">
                    {info.map(item => (
                        <div key={item.title} className="flex flex-row justify-between gap-1 py-4">
                            <span className="text-muted-foreground text-sm">{item.title}</span>
                            <span className="text-sm font-medium">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

'use client';
import {
    ApiKeys,
    SETTING_TABS,
    useApiKeysStore,
    useChatStore,
    useMcpToolsStore,
} from '@repo/common/store';
import { Badge, Dialog, DialogContent, DialogFooter, Input, Switch } from '@repo/ui';
import { Button } from '@repo/ui/src/components/button';
import { IconBoltFilled } from '@tabler/icons-react';
import { ArrowUpRight } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';

const SettingsPage = () => {
    const settingMenu = [
        {
            title: 'Usage',
            description: 'Manage your usage credits',
            key: SETTING_TABS.CREDITS,
            component: <CreditsSettings />,
        },
        {
            title: 'API Keys',
            description:
                'By default, your API Key is stored locally on your browser and never sent anywhere else.',
            key: SETTING_TABS.API_KEYS,
            component: <ApiKeySettings />,
        },
        {
            title: 'MCP Tools',
            description: 'Connect your MCP tools. This will only work with your own API keys.',
            key: SETTING_TABS.MCP_TOOLS,
            component: <MCPSettings />,
        },
    ];

    return (
        <div className="no-scrollbar relative max-w-full overflow-y-auto overflow-x-hidden">
            <div className="flex flex-row gap-6 py-12">
                <div className="mx-auto flex max-w-2xl flex-1 flex-col gap-8 overflow-hidden px-4">
                    <h3 className="border-border bg-secondary text-xl font-semibold">Settings</h3>
                    {settingMenu.map(item => (
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col">
                                <h4 className="text-base font-semibold">{item.title}</h4>
                            </div>
                            <div
                                key={item.key}
                                className="bg-background rounded-md border px-6 py-2"
                            >
                                {item.component}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

export const MCPSettings = () => {
    const [isAddToolDialogOpen, setIsAddToolDialogOpen] = useState(false);
    const { mcpConfig, addMcpConfig, removeMcpConfig, updateSelectedMCP, selectedMCP } =
        useMcpToolsStore();

    return (
        <div className="flex w-full flex-col gap-6 overflow-x-hidden">
            <div className="flex flex-col">
                <p className="text-muted-foreground border-b py-4 text-xs font-medium">
                    Available Tools{' '}
                    <Badge
                        variant="secondary"
                        className="inline-flex items-center gap-1 rounded-full bg-transparent text-blue-600"
                    >
                        <span className="inline-block size-2 rounded-full bg-blue-600"></span>
                        {selectedMCP.length} Connected
                    </Badge>
                </p>
                <div className="divide-border flex w-full flex-col gap-1 divide-y">
                    {mcpConfig &&
                        Object.keys(mcpConfig).length > 0 &&
                        Object.keys(mcpConfig).map(key => (
                            <div
                                key={key}
                                className="flex flex-row items-center justify-between gap-1 px-0.5 py-4"
                            >
                                <div className="flex flex-1 flex-row items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <Badge>{key}</Badge>
                                    </div>
                                    <span className="text-muted-foreground line-clamp-1 text-xs">
                                        {mcpConfig[key]}
                                    </span>
                                </div>
                                <div className="flex flex-1 items-center justify-end gap-2">
                                    <Switch
                                        className="data-[state=unchecked]:bg-muted data-[state=checked]:bg-emerald-600"
                                        checked={selectedMCP.includes(key)}
                                        onCheckedChange={() => {
                                            updateSelectedMCP(prev => {
                                                if (prev.includes(key)) {
                                                    return prev.filter(tool => tool !== key);
                                                }
                                                return [...prev, key];
                                            });
                                        }}
                                    />
                                    <Button
                                        size="xs"
                                        variant="bordered"
                                        onClick={() => {
                                            removeMcpConfig(key);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                </div>
                <Button
                    size="sm"
                    className="mt-4 self-start"
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
                        <Button variant="bordered" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddTool}>Add Tool</Button>
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
        console.log(`Validating ${provider} API key: ${apiKey}`);
        return true;
    };

    const handleSave = (keyName: keyof ApiKeys, value: string) => {
        setApiKey(keyName, value);
        setIsEditing(null);
    };

    const getMaskedKey = (key: string) => {
        if (!key) return '';
        return '••••••••••••••' + key.slice(-4);
    };

    return (
        <div className="flex flex-col items-start gap-2">
            <div className="divide-border flex w-full flex-col gap-1 divide-y">
                {apiKeyList.map(apiKey => (
                    <div
                        key={apiKey.key}
                        className="flex flex-row items-center justify-between gap-1 py-4"
                    >
                        <div className="flex min-w-[120px] flex-col gap-0">
                            <span className="text-muted-foreground text-sm font-medium">
                                {apiKey.name} API Key
                            </span>
                            <a
                                href={apiKey.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground/50 flex flex-row items-center gap-0 text-xs underline-offset-2 hover:underline"
                            >
                                Get API key <ArrowUpRight size={14} />
                            </a>
                        </div>
                        <div className="flex flex-1 items-center justify-end gap-2">
                            {isEditing === apiKey.key ? (
                                <>
                                    <Input
                                        value={apiKey.value || ''}
                                        placeholder={`Enter ${apiKey.name} API key`}
                                        onChange={e => setApiKey(apiKey.key, e.target.value)}
                                        className="w-56"
                                    />
                                    <Button
                                        variant="bordered"
                                        size="sm"
                                        onClick={() => handleSave(apiKey.key, apiKey.value || '')}
                                    >
                                        Save
                                    </Button>
                                </>
                            ) : (
                                <div className="flex flex-row items-center justify-end gap-0">
                                    <div className="flex min-w-[180px] items-center justify-end gap-0 rounded-md px-3 py-1.5">
                                        {apiKey.value && (
                                            <span className="flex-1 text-sm">
                                                {getMaskedKey(apiKey.value)}
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        variant={apiKey.value ? 'bordered' : 'default'}
                                        size="sm"
                                        onClick={() => setIsEditing(apiKey.key)}
                                    >
                                        {apiKey.value ? 'Change Key' : 'Add Key'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
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
                <Badge variant="secondary" className="bg-brand/10 text-brand rounded-full">
                    <span className="text-xs font-medium">FREE</span>
                </Badge>
            ),
        },
        {
            title: 'Credits',
            value: (
                <div className="flex h-7 flex-row items-center gap-1 rounded-full py-1">
                    <IconBoltFilled size={14} strokeWidth={2} className="text-brand" />
                    <span className="text-brand text-sm font-medium">{remainingCredits}</span>
                    <span className="text-brand text-sm opacity-50">/</span>
                    <span className="text-brand text-sm opacity-50">{maxLimit}</span>
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

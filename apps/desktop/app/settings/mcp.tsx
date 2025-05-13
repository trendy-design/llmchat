import { useMcpToolsStore } from '@repo/common/store';
import { Badge } from '@repo/ui/src/components/badge';
import { Button } from '@repo/ui/src/components/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@repo/ui/src/components/hover-card';
import { Switch } from '@repo/ui/src/components/switch';
import { Hammer, RefreshCcw, Trash } from 'lucide-react';
import { useState } from 'react';
import { AddToolDialog } from './add-mcp-tool-dialog';

export const MCPSettings = () => {
    const [isAddToolDialogOpen, setIsAddToolDialogOpen] = useState(false);
    const { mcpConfig, addMcpConfig, removeMcpConfig, updateSelectedMCP, selectedMCP } =
        useMcpToolsStore();

    return (
        <div className="flex w-full flex-col gap-6 overflow-x-hidden">
            <div className="flex flex-col">
                <p className="text-muted-foreground py-4 text-xs font-medium">
                    Available Tools{' '}
                    <Badge
                        variant="secondary"
                        className="inline-flex items-center gap-1 rounded-full bg-transparent text-blue-400"
                    >
                        <span className="inline-block size-2 rounded-full bg-blue-400"></span>
                        {selectedMCP.length} Connected
                    </Badge>
                </p>
                <div className="flex w-full flex-col gap-2">
                    {mcpConfig &&
                        Object.keys(mcpConfig).length > 0 &&
                        Object.keys(mcpConfig).map(key => (
                            <div
                                key={key}
                                className="bg-secondary flex w-full flex-row items-center justify-between gap-1 rounded-lg border p-4"
                            >
                                <div className="flex w-full flex-col items-start gap-2">
                                    <div className="flex w-full flex-row items-center justify-between gap-4">
                                        <div className="flex flex-1 flex-col overflow-hidden">
                                            <div className="flex w-full flex-row items-center gap-0">
                                                <p className="flex items-center gap-2 text-sm font-medium">
                                                    {key}
                                                </p>
                                                <HoverCard>
                                                    <HoverCardTrigger>
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-muted-foreground/50 rounded-full bg-transparent"
                                                        >
                                                            <Hammer size={14} strokeWidth={2} />
                                                            {mcpConfig[key]?.tools?.length} Tools
                                                        </Badge>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent className="bg-popover max-w-md">
                                                        <div className="text-muted-foreground flex w-full flex-row flex-wrap gap-2">
                                                            {mcpConfig[key]?.tools?.map(tool => (
                                                                <Badge key={tool}>{tool}</Badge>
                                                            ))}
                                                        </div>
                                                    </HoverCardContent>
                                                </HoverCard>
                                            </div>
                                            <div className="text-muted-foreground/50 min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs">
                                                {mcpConfig[key]?.url}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center justify-end gap-2">
                                            <Switch
                                                className="data-[state=unchecked]:bg-muted data-[state=checked]:bg-orange-500"
                                                checked={selectedMCP.includes(key)}
                                                onCheckedChange={() => {
                                                    updateSelectedMCP(prev => {
                                                        if (prev.includes(key)) {
                                                            return prev.filter(
                                                                tool => tool !== key
                                                            );
                                                        }
                                                        return [...prev, key];
                                                    });
                                                }}
                                            />
                                            <Button
                                                size="icon-xs"
                                                variant="ghost"
                                                tooltip="Refresh"
                                                onClick={() => {
                                                    removeMcpConfig(key);
                                                }}
                                            >
                                                <RefreshCcw size={14} strokeWidth={2} />
                                            </Button>
                                            <Button
                                                size="icon-xs"
                                                variant="ghost"
                                                tooltip="Remove"
                                                onClick={() => {
                                                    removeMcpConfig(key);
                                                }}
                                            >
                                                <Trash size={14} strokeWidth={2} />
                                            </Button>
                                        </div>
                                    </div>
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

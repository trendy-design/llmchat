import { IconPlus, IconTrash } from "@tabler/icons-react";

import { useMcpToolsStore } from "@/libs/store/mcp-tools.store";
import { Button } from "@repo/ui/src/components/button";

import { Badge, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Input } from "@repo/ui";

import { IconCheck, IconTools } from "@tabler/icons-react";
import { useState } from "react";
import { ToolIcon } from "./chat-input/chat-actions";


export const ToolsMenu = () => {
        const [isOpen, setIsOpen] = useState(false);
        const [openAddToolDialog, setOpenAddToolDialog] = useState(false);
        const [mcpToolName, setMcpToolName] = useState("");
        const [mcpToolUrl, setMcpToolUrl] = useState("");
        const { mcpConfig, addMcpConfig, removeMcpConfig, updateSelectedMCP, selectedMCP } = useMcpToolsStore();


        return (
                <>
                        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                                <DropdownMenuTrigger asChild>
                                        <Button size={selectedMCP.length > 0 ? "sm" : "icon"} tooltip="Tools" variant={(isOpen || selectedMCP.length > 0) ? "secondary" : "ghost"} className='gap-2' rounded="full">
                                                        <IconTools size={18} strokeWidth={2} className="text-muted-foreground" />
                                                {selectedMCP.length > 0 && (
                                                        <Badge variant="outline"  className="h-5 rounded-full px-2.5 bg-foreground text-background">
                                                                {selectedMCP.length}
                                                        </Badge>
                                                )}
                                        </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" side="bottom" className='w-[320px]'>
                                        {
                                                Object.keys(mcpConfig).map(key => (
                                                        <DropdownMenuItem key={key} onClick={() => updateSelectedMCP(prev => {
                                                                if (prev.includes(key)) {
                                                                        return prev.filter(mcp => mcp !== key);
                                                                }
                                                                return [...prev, key];
                                                        })}>
                                                                <div className="flex w-full items-center gap-2 justify-between">
                                                                        <ToolIcon/>
                                                                        <span>{key}</span>
                                                                        <div className="flex-1" />
                                                                        {selectedMCP.includes(key) && (
                                                                                <IconCheck size={16} className="text-foreground" />
                                                                        )}
                                                                </div>
                                                        </DropdownMenuItem>
                                                ))
                                        }
                                        {
                                                mcpConfig && Object.keys(mcpConfig).length === 0 && (
                                                        <div className='flex flex-col justify-center items-center gap-2 h-[150px]'>
                                                                <IconTools size={16} strokeWidth={2} className="text-muted-foreground" />
                                                                <p className='text-sm text-muted-foreground'>No tools found</p>
                                                                <Button rounded="full" variant="bordered" className='text-xs text-muted-foreground' onClick={() => {
                                                                        setOpenAddToolDialog(true);
                                                                }}>
                                                                        <IconPlus size={14} strokeWidth={2} className="text-muted-foreground" />
                                                                        Add Tool
                                                                </Button>
                                                        </div>
                                                )
                                        }
                                        {
                                                mcpConfig && Object.keys(mcpConfig).length > 0 && (
                                                        <DropdownMenuSeparator />
                                                )
                                        }
                                        {
                                                mcpConfig && Object.keys(mcpConfig).length > 0 && (
                                                        <DropdownMenuItem onClick={() => {
                                                                setOpenAddToolDialog(true);
                                                        }}>
                                                                <IconPlus size={14} strokeWidth={2} className="text-muted-foreground" />
                                                                Add Tool
                                                        </DropdownMenuItem>
                                                )
                                        }
                                </DropdownMenuContent>
                        </DropdownMenu>


                        <Dialog open={openAddToolDialog} onOpenChange={setOpenAddToolDialog}>
                                <DialogContent ariaTitle="Add Tool" className='!w-[600px] p-0'>
                                        <DialogHeader className="p-6 gap-0">
                                                <DialogTitle>Add Tool</DialogTitle>
                                                <DialogDescription className="text-xs text-muted-foreground">
                                                        Add a new tool to the chat. You can get MCP servers from:
                                                </DialogDescription>
                                        </DialogHeader>

                                        <div className="px-6 pb-4 w-full overflow-x-hidden flex flex-col gap-2">
                                                <p className="text-xs text-muted-foreground font-medium">Connected Tools <Badge variant="secondary" className="inline-flex bg-transparent text-emerald-600 rounded-full items-center gap-1"><span className="size-2 inline-block bg-emerald-600 rounded-full"></span>{mcpConfig && Object.keys(mcpConfig).length} Connected</Badge></p>
                                        {
                                                mcpConfig && Object.keys(mcpConfig).length > 0 && (

                                                        Object.keys(mcpConfig).map(key => (
                                                                <div className='flex flex-row items-center gap-2 divide-x-2 bg-secondary h-12 divide-border border-border border rounded-lg py-2 px-2.5 flex-1 w-full'>

                                                                        <div key={key} className='flex flex-row items-center gap-2 w-full'>
                                                                                <ToolIcon /> <Badge>{key}</Badge>
                                                                                <p className='text-sm text-muted-foreground line-clamp-1 flex-1'>{mcpConfig[key]}</p>

                                                                                <Button size="xs" variant="ghost" tooltip="Delete Tool" onClick={() => {
                                                                                        removeMcpConfig(key);
                                                                                }}>
                                                                                        <IconTrash size={14} strokeWidth={2} className="text-muted-foreground" />
                                                                                        </Button>
                                                                        </div>
                                                                </div>

                                                        ))

                                                )
                                        }

<p className="text-xs text-muted-foreground font-medium">Add New Tool </p>

                                        <div className='flex flex-row p-0 items-center border divide-x border-border bg-background rounded-lg h-12 w-full'>
                                                <div className="h-full flex items-center">
                                                <Input
                                                        placeholder="Tool Name"
                                                        className='w-[100px]'
                                                        variant="ghost"
                                                        size="sm"
                                                        value={mcpToolName}
                                                        onChange={(e) => {
                                                                const key = e.target.value?.trim().toLowerCase().replace(/ /g, "-");
                                                               
                                                                        setMcpToolName(key);
                                                                
                                                        }}
                                                />
                                                </div>
                                                <div className="h-full flex items-center flex-1">
                                                <Input
                                                        placeholder="https://your-mcp-server.com"
                                                        variant="ghost"
                                                        className='flex-1'
                                                        size="sm"
                                                        value={mcpToolUrl}
                                                        onChange={(e) => {
                                                                setMcpToolUrl(e.target.value);
                                                        }}
                                                />
                                                </div>
                                        </div>
                                        <div className="mt-2 text-sm text-muted-foreground">
                                                <p>Format: <span className="font-mono bg-muted px-1 rounded">name</span> will be automatically converted to lowercase with hyphens</p>
                                                <p>Example URL: <span className="font-mono bg-muted px-1 rounded">https://your-mcp-server.com</span></p>
                                        </div>
                                        
                                        <div className="mt-6 pt-4 border-t border-border border-dashed">
                                                <p className="text-xs text-muted-foreground">Learn more about MCP:</p>
                                                <div className="mt-2 flex flex-col gap-2 text-sm">
                                                        <a 
                                                                href="https://mcp.composio.dev" 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:underline inline-flex items-center"
                                                        >
                                                                Browse Composio MCP Directory →
                                                        </a>
                                                        <a 
                                                                href="https://www.anthropic.com/news/model-context-protocol" 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:underline inline-flex items-center"
                                                        >
                                                                Read MCP Documentation →
                                                        </a>
                                                </div>
                                        </div>
                                        </div>
                                        <DialogFooter className="px-6 py-4 border-t border-border" >
                                        <Button variant="ghost" size="sm" onClick={() => {
                                                        setOpenAddToolDialog(false);
                                                }}>Cancel</Button>
                                                <Button variant="default" size="sm" onClick={() => {
                                                        addMcpConfig({ [mcpToolName]: mcpToolUrl });
                                                        setOpenAddToolDialog(false);
                                                }}>Save</Button>
                                        </DialogFooter>
                                </DialogContent>
                        </Dialog>

                </>
        );
};
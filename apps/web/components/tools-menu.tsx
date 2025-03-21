import { IconPlus } from "@tabler/icons-react";

import { useMcpToolsStore } from "@/libs/store/mcp-tools.store";
import { Button } from "@repo/ui/src/components/button";

import { Badge, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Input } from "@repo/ui";

import { IconCheck, IconTools } from "@tabler/icons-react";
import { useState } from "react";
import { ToolIcon } from "./chat-input/chat-actions";


export const ToolsMenu = () => {
        const [openAddToolDialog, setOpenAddToolDialog] = useState(false);
        const [mcpToolName, setMcpToolName] = useState("");
        const [mcpToolUrl, setMcpToolUrl] = useState("");
        const { mcpConfig, addMcpConfig, removeMcpConfig, updateSelectedMCP, selectedMCP } = useMcpToolsStore();


        return (
                <>
                        <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                        <Button size="xs" variant="ghost" className='pl-1 gap-2'>
                                                <div className='bg-yellow-500/20 border-yellow-500/30 border rounded-md p-0.5 size-5 flex items-center justify-center'>
                                                        <IconTools size={20} strokeWidth={2} className="text-yellow-600" />
                                                </div>
                                                Tools
                                                {selectedMCP.length > 0 && (
                                                        <Badge variant="outline" className="ml-1 px-1">
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
                                                                <div className="flex w-full items-center justify-between">
                                                                        <span>{key}</span>
                                                                        {selectedMCP.includes(key) && (
                                                                                <IconCheck size={16} className="text-green-500" />
                                                                        )}
                                                                </div>
                                                        </DropdownMenuItem>
                                                ))
                                        }
                                        {
                                                mcpConfig && Object.keys(mcpConfig).length === 0 && (
                                                        <div className='flex flex-col justify-center items-center gap-2 h-[150px]'>
                                                                <IconTools size={16} strokeWidth={2} className="text-muted-foreground/50" />
                                                                <p className='text-xs text-muted-foreground'>No tools found</p>
                                                                <Button size="xs" variant="bordered" className='text-xs text-muted-foreground' onClick={() => {
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
                                <DialogContent ariaTitle="Add Tool" className='max-w-[300px]'>
                                        <DialogHeader>
                                                <DialogTitle>Add MCP Tool</DialogTitle>
                                        </DialogHeader>
                                        <DialogDescription>
                                                Add a new tool to the chat.
                                        </DialogDescription>
                                        {
                                                mcpConfig && Object.keys(mcpConfig).length > 0 && (

                                                        Object.keys(mcpConfig).map(key => (
                                                                <div className='flex flex-row items-center gap-2 divide-x-2 divide-border border-border border rounded-md py-1.5 px-2.5 w-full'>

                                                                        <div key={key} className='flex flex-row items-center gap-2 w-full'>
                                                                                <ToolIcon /> <Badge>{key}</Badge>
                                                                                <p className='text-xs text-muted-foreground line-clamp-1 flex-1'>{mcpConfig[key]}</p>

                                                                                <Button size="xs" variant="ghost" onClick={() => {
                                                                                        removeMcpConfig(key);
                                                                                }}>Delete</Button>
                                                                        </div>
                                                                </div>

                                                        ))

                                                )
                                        }
                                        <div className='flex flex-row gap-1 items-center divide-x-2 divide-border border-border border rounded-md p-0.5 px-2.5 w-full'>
                                                <ToolIcon className="opacity-50" />
                                                <Input
                                                        placeholder="Tool Name"
                                                        className='w-[100px]'
                                                        variant="default"
                                                        size="sm"
                                                        value={mcpToolName}
                                                        onChange={(e) => {

                                                                const key = e.target.value?.trim().toLowerCase().replace(/ /g, "-");
                                                                if (key) {
                                                                        setMcpToolName(key);
                                                                }
                                                        }}
                                                />
                                                <Input
                                                        placeholder="MCP Server URL"
                                                        variant="default"
                                                        className='flex-1'
                                                        size="sm"
                                                        value={mcpToolUrl}
                                                        onChange={(e) => {
                                                                setMcpToolUrl(e.target.value);
                                                        }}
                                                />
                                        </div>
                                        <DialogFooter>
                                                <Button size="xs" variant="default" onClick={() => {
                                                        addMcpConfig({ [mcpToolName]: mcpToolUrl });
                                                        setOpenAddToolDialog(false);
                                                }}>Save</Button>
                                        </DialogFooter>
                                </DialogContent>
                        </Dialog>

                </>
        );
};
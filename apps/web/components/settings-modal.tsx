"use client";
import { useApiKeysStore } from "@/libs/store/api-keys.store";
import { Button, Dialog, DialogContent, DialogFooter, DialogTrigger, Input } from "@repo/ui";
import { useState } from "react";

export const SettingsModal = ({ children }: { children: React.ReactNode }) => {

        const [isOpen, setIsOpen] = useState(false);
        const apiKeys = useApiKeysStore(state => state.getAllKeys());
        const setApiKey = useApiKeysStore(state => state.setKey);

        const apiKeyList = [
                {
                        name: "OpenAI",
                        description: "OpenAI API key",
                        value: apiKeys.OPENAI_API_KEY,
                        onChange: (value: string) => {
                                setApiKey("OPENAI_API_KEY", value);
                        }
                },
                {
                        name: "Google",
                        description: "Google API key",
                        value: apiKeys.GEMINI_API_KEY,
                        onChange: (value: string) => {
                                setApiKey("GEMINI_API_KEY", value);
                        }
                },
                {
                        name: "Anthropic",
                        description: "Anthropic API key",
                        value: apiKeys.ANTHROPIC_API_KEY,
                        onChange: (value: string) => {
                                setApiKey("ANTHROPIC_API_KEY", value);
                        }
                },
                {
                        name: "Jina",
                        description: "Jina API key",
                        value: apiKeys.JINA_API_KEY,
                        onChange: (value: string) => {
                                setApiKey("JINA_API_KEY", value);
                        }
                },
                {
                        name: "Fireworks",
                        description: "Fireworks API key",
                        value: apiKeys.FIREWORKS_API_KEY,
                        onChange: (value: string) => {
                                setApiKey("FIREWORKS_API_KEY", value);
                        }
                },
                {
                        name: "Serper",
                        description: "Serper API key",
                        value: apiKeys.SERPER_API_KEY,
                        onChange: (value: string) => {
                                setApiKey("SERPER_API_KEY", value);
                        }
                }
        ]

        return <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                        {children}
                </DialogTrigger>
                <DialogContent ariaTitle="Settings">
                        <h1 className="text-2xl font-bold mb-4 w-full">Settings</h1>
                        <div className="flex flex-col w-full divide-border">
                                {apiKeyList.map((apiKey) => (
                                        <div key={apiKey.name} className="flex flex-row items-center gap-2 w-full py-3">
                                                <div className="flex flex-col justify-center flex-1 gap-0.5 w-full">
                                                        <p className="text-sm font-medium flex-1 text-left">{apiKey.name}</p>
                                                        <p className="text-xs text-muted-foreground flex-1 text-left">{apiKey.description}</p>
                                                </div>
                                                <Input
                                                        value={apiKey.value}
                                                        className="w-full flex-1"
                                                        size="sm"
                                                        placeholder="Enter your API key"
                                                        onChange={(e) => apiKey.onChange(e.target.value)}
                                                />
                                        </div>
                                ))}
                        </div>
                        <DialogFooter>
                        <Button variant="secondary" onClick={() => {
                                setIsOpen(false);
                        }}>
                               Close
                        </Button>
                </DialogFooter>
                </DialogContent>
             
        </Dialog>
}
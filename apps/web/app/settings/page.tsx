"use client";
import { useApiKeysStore } from "@/libs/store/api-keys.store";
import { Input } from "@repo/ui";

export default function SettingsPage() {

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

        return <div className="max-w-xl w-full mx-auto pt-8">
                <h1 className="text-2xl font-bold mb-4 w-full">Settings</h1>
                <div className="flex flex-col divide-y w-full divide-border">
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
                        </div>
      
}
import { ApiKeys, useApiKeysStore } from '@repo/common/store';
import { Button } from '@repo/ui/src/components/button';
import { Input } from '@repo/ui/src/components/input';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

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

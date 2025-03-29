'use client';
import { DotSpinner } from '@repo/common/components';
import { useApiKeysStore, useChatStore } from '@repo/common/store';
import { CHAT_MODE_CREDIT_COSTS, ChatMode } from '@repo/shared/config';
import {
    Button,
    cn,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    Kbd,
} from '@repo/ui';
import {
    IconArrowUp,
    IconAtom,
    IconChevronDown,
    IconPaperclip,
    IconPlayerStopFilled,
    IconWorld,
} from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { BYOKIcon, CreditIcon, DeepResearchIcon } from '../icons';

export const chatOptions = [
    {
        label: 'Deep Research',
        description: 'In depth research on complex topic',
        value: ChatMode.Deep,
        icon: <DeepResearchIcon />,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.Deep],
    },
    {
        label: 'Pro Search',
        description: 'Pro search with web search',
        value: ChatMode.Pro,
        icon: <IconAtom size={20} className="text-muted-foreground" strokeWidth={2} />,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.Pro],
    },
];

export const modelOptions = [
    {
        label: 'Gemini Flash 2.0',
        value: ChatMode.GEMINI_2_FLASH,
        // webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.GEMINI_2_FLASH],
    },

    {
        label: 'GPT 4o Mini',
        value: ChatMode.GPT_4o_Mini,
        // webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.GPT_4o_Mini],
    },

    {
        label: 'O3 Mini',
        value: ChatMode.O3_Mini,
        // webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.O3_Mini],
    },

    {
        label: 'Claude 3.5 Sonnet',
        value: ChatMode.CLAUDE_3_5_SONNET,
        // webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.CLAUDE_3_5_SONNET],
    },

    {
        label: 'Deepseek R1',
        value: ChatMode.DEEPSEEK_R1,
        // webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.DEEPSEEK_R1],
    },

    {
        label: 'Claude 3.7 Sonnet',
        value: ChatMode.CLAUDE_3_7_SONNET,
        // webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.CLAUDE_3_7_SONNET],
    },
];

export const AttachmentButton = () => {
    return (
        <Button
            size="icon"
            tooltip="Attachment (coming soon)"
            variant="ghost"
            className="gap-2"
            rounded="full"
            disabled
        >
            <IconPaperclip size={18} strokeWidth={2} className="text-muted-foreground" />
        </Button>
    );
};

export const ChatModeButton = () => {
    const chatMode = useChatStore(state => state.chatMode);
    const setChatMode = useChatStore(state => state.setChatMode);
    const [isChatModeOpen, setIsChatModeOpen] = useState(false);
    const hasApiKeyForChatMode = useApiKeysStore(state => state.hasApiKeyForChatMode);

    const selectedOption = [...chatOptions, ...modelOptions].find(
        option => option.value === chatMode
    );

    return (
        <DropdownMenu open={isChatModeOpen} onOpenChange={setIsChatModeOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant={isChatModeOpen ? 'secondary' : 'ghost'} size="sm" rounded="full">
                    {selectedOption?.icon}
                    {selectedOption?.label}
                    <IconChevronDown size={16} strokeWidth={2} />
                </Button>
            </DropdownMenuTrigger>
            <ChatModeOptions chatMode={chatMode} setChatMode={setChatMode} />
        </DropdownMenu>
    );
};

export const WebSearchButton = () => {
    const useWebSearch = useChatStore(state => state.useWebSearch);
    const setUseWebSearch = useChatStore(state => state.setUseWebSearch);
    const chatMode = useChatStore(state => state.chatMode);
    const hasApiKeyForChatMode = useApiKeysStore(state => state.hasApiKeyForChatMode);

    if (chatMode === ChatMode.Deep || chatMode === ChatMode.Pro || hasApiKeyForChatMode(chatMode))
        return null;

    return (
        <Button
            size={useWebSearch ? 'sm' : 'icon'}
            tooltip="Web Search"
            variant={useWebSearch ? 'secondary' : 'ghost'}
            className={cn('gap-2', useWebSearch && 'bg-emerald-500/20 pl-2 text-emerald-600')}
            rounded="full"
            onClick={() => setUseWebSearch(!useWebSearch)}
        >
            <IconWorld
                size={18}
                strokeWidth={2}
                className={cn(useWebSearch ? '!text-emerald-600' : 'text-muted-foreground')}
            />
            {useWebSearch && <p className="text-xs">Web</p>}
        </Button>
    );
};

export const NewLineIndicator = () => {
    const editor = useChatStore(state => state.editor);
    const hasTextInput = !!editor?.getText();

    if (!hasTextInput) return null;

    return (
        <p className="flex flex-row items-center gap-1 text-xs text-gray-500">
            use <Kbd>Shift</Kbd> <Kbd>Enter</Kbd> for new line
        </p>
    );
};

export const GeneratingStatus = () => {
    return (
        <div className="text-muted-foreground flex flex-row items-center gap-1 px-2 text-xs">
            <DotSpinner /> Generating...
        </div>
    );
};

export const ChatModeOptions = ({
    chatMode,
    setChatMode,
}: {
    chatMode: ChatMode;
    setChatMode: (chatMode: ChatMode) => void;
}) => {
    const hasApiKeyForChatMode = useApiKeysStore(state => state.hasApiKeyForChatMode);

    return (
        <DropdownMenuContent align="start" side="bottom" className="w-[320px]">
            <DropdownMenuGroup>
                <DropdownMenuLabel>Advanced Mode</DropdownMenuLabel>
                {chatOptions.map(option => (
                    <DropdownMenuItem
                        key={option.label}
                        onSelect={() => {
                            setChatMode(option.value);
                        }}
                        className="h-auto"
                    >
                        <div className="flex w-full flex-row items-start gap-1.5 px-1.5 py-1.5">
                            <div className="flex flex-col gap-0 pt-1">{option.icon}</div>

                            <div className="flex flex-col gap-0">
                                {<p className="m-0 text-sm font-medium">{option.label}</p>}
                                {option.description && (
                                    <p className="text-muted-foreground text-xs font-light">
                                        {option.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex-1" />

                            <CreditIcon credits={option.creditCost ?? 0} variant="muted" />
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
            <DropdownMenuGroup>
                <DropdownMenuLabel>Models</DropdownMenuLabel>
                {modelOptions.map(option => (
                    <DropdownMenuItem
                        key={option.label}
                        onSelect={() => {
                            setChatMode(option.value);
                        }}
                        className="h-auto"
                    >
                        <div className="flex w-full flex-row items-center gap-2.5 px-1.5 py-1.5">
                            <div className="flex flex-col gap-0">
                                {<p className="text-sm font-medium">{option.label}</p>}
                            </div>
                            <div className="flex-1" />
                            {hasApiKeyForChatMode(option.value) ? (
                                <BYOKIcon />
                            ) : (
                                <CreditIcon credits={option.creditCost ?? 0} variant="muted" />
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
        </DropdownMenuContent>
    );
};

export const SendStopButton = ({
    isGenerating,
    isChatPage,
    stopGeneration,
    hasTextInput,
    sendMessage,
}: {
    isGenerating: boolean;
    isChatPage: boolean;
    stopGeneration: () => void;
    hasTextInput: boolean;
    sendMessage: () => void;
}) => {
    return (
        <div className="flex flex-row items-center gap-2">
            <AnimatePresence mode="wait" initial={false}>
                {isGenerating && !isChatPage ? (
                    <motion.div
                        key="stop-button"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            size="sm"
                            rounded="full"
                            variant="default"
                            onClick={stopGeneration}
                            tooltip="Stop Generation"
                        >
                            <IconPlayerStopFilled size={14} strokeWidth={2} />
                            Stop
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="send-button"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            size="icon-sm"
                            rounded="full"
                            tooltip="Send Message"
                            variant={hasTextInput ? 'default' : 'secondary'}
                            disabled={!hasTextInput || isGenerating}
                            onClick={() => {
                                sendMessage();
                            }}
                        >
                            <IconArrowUp size={20} strokeWidth={2} />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

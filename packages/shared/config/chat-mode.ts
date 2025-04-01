export enum ChatMode {
    Pro = 'pro',
    Deep = 'deep',
    O3_Mini = 'o3-mini',
    GPT_4o_Mini = 'gpt-4o-mini',
    GEMINI_2_FLASH = 'gemini-flash-2.0',
    DEEPSEEK_R1 = 'deepseek-r1',
    CLAUDE_3_5_SONNET = 'claude-3-5-sonnet',
    CLAUDE_3_7_SONNET = 'claude-3-7-sonnet',
}

export const ChatModeConfig = {
    [ChatMode.Deep]: {
        webSearch: false,
        imageUpload: false,
        retry: false,
    },
    [ChatMode.Pro]: {
        webSearch: false,
        imageUpload: false,
        retry: false,
    },
    [ChatMode.O3_Mini]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
    },
    [ChatMode.GPT_4o_Mini]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
    },
    [ChatMode.CLAUDE_3_5_SONNET]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
    },
    [ChatMode.CLAUDE_3_7_SONNET]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
    },
    [ChatMode.GEMINI_2_FLASH]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
    },
    [ChatMode.DEEPSEEK_R1]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
    },
};

export const CHAT_MODE_CREDIT_COSTS = {
    [ChatMode.Deep]: 10,
    [ChatMode.Pro]: 5,
    [ChatMode.GPT_4o_Mini]: 1,
    [ChatMode.O3_Mini]: 5,
    [ChatMode.CLAUDE_3_5_SONNET]: 5,
    [ChatMode.CLAUDE_3_7_SONNET]: 5,
    [ChatMode.GEMINI_2_FLASH]: 1,
    [ChatMode.DEEPSEEK_R1]: 5,
};

export const getChatModeName = (mode: ChatMode) => {
    switch (mode) {
        case ChatMode.Deep:
            return 'Deep Research';
        case ChatMode.Pro:
            return 'Pro Search';
        case ChatMode.GPT_4o_Mini:
            return 'GPT 4o Mini';
        case ChatMode.CLAUDE_3_5_SONNET:
            return 'Claude 3.5 Sonnet';
        case ChatMode.CLAUDE_3_7_SONNET:
            return 'Claude 3.7 Sonnet';
        case ChatMode.O3_Mini:
            return 'O3 Mini';
        case ChatMode.DEEPSEEK_R1:
            return 'DeepSeek R1';
        case ChatMode.GEMINI_2_FLASH:
            return 'Gemini 2 Flash';
    }
};

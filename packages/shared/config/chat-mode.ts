export enum ChatMode {
    Deep = 'deep',
    Agent = 'agent',
    O4_Mini = 'o4-mini',
    GPT_4_1 = 'gpt-4.1',
    GPT_4_1_Mini = 'gpt-4.1-mini',
    GPT_4_1_Nano = 'gpt-4.1-nano',
    GPT_4o_Mini = 'gpt-4o-mini',
    LLAMA_4_SCOUT = 'llama-4-scout',
    GEMINI_2_FLASH = 'gemini-flash-2.0',
    GEMINI_2_5_FLASH = 'gemini-2.5-flash-preview-04-17',
    DEEPSEEK_R1 = 'deepseek-r1',
    CLAUDE_3_5_SONNET = 'claude-3-5-sonnet',
    CLAUDE_3_7_SONNET = 'claude-3-7-sonnet',
}

export const ChatModeConfig: Record<
    ChatMode,
    {
        webSearch: boolean;
        imageUpload: boolean;
        supportMcp: boolean;
        retry: boolean;
        isNew?: boolean;
        isAuthRequired?: boolean;
    }
> = {
    [ChatMode.Deep]: {
        webSearch: false,
        imageUpload: false,
        supportMcp: false,
        retry: false,
        isAuthRequired: true,
    },
    // [ChatMode.Pro]: {
    //     webSearch: false,
    //     imageUpload: false,
    //     supportMcp: false,
    //     retry: false,
    //     isAuthRequired: true,
    // },
    [ChatMode.Agent]: {
        webSearch: false,
        imageUpload: true,
        supportMcp: true,
        retry: false,
        isAuthRequired: true,
    },
    [ChatMode.GPT_4_1]: {
        webSearch: true,
        imageUpload: true,
        supportMcp: false,
        retry: true,
        isNew: true,
        isAuthRequired: true,
    },
    [ChatMode.GPT_4_1_Mini]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isNew: true,
        supportMcp: false,

        isAuthRequired: true,
    },
    [ChatMode.GPT_4_1_Nano]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isNew: true,
        supportMcp: false,

        isAuthRequired: false,
    },
    [ChatMode.LLAMA_4_SCOUT]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        isNew: true,
        supportMcp: false,

        isAuthRequired: false,
    },
    [ChatMode.O4_Mini]: {
        webSearch: true,
        imageUpload: false,
        retry: true,
        isNew: true,
        supportMcp: false,

        isAuthRequired: true,
    },
    [ChatMode.GPT_4o_Mini]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        supportMcp: false,

        isAuthRequired: false,
    },
    [ChatMode.CLAUDE_3_5_SONNET]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        supportMcp: false,

        isAuthRequired: true,
    },
    [ChatMode.CLAUDE_3_7_SONNET]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        supportMcp: false,

        isAuthRequired: true,
    },
    [ChatMode.GEMINI_2_FLASH]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        supportMcp: false,

        isAuthRequired: false,
    },
    [ChatMode.GEMINI_2_5_FLASH]: {
        webSearch: true,
        imageUpload: true,
        retry: true,
        supportMcp: false,
        isNew: true,
        isAuthRequired: false,
    },
    [ChatMode.DEEPSEEK_R1]: {
        webSearch: true,
        imageUpload: false,
        retry: true,
        supportMcp: false,

        isAuthRequired: true,
    },
};

export const CHAT_MODE_CREDIT_COSTS = {
    [ChatMode.Deep]: 10,
    // [ChatMode.Pro]: 5,
    [ChatMode.Agent]: 1,
    [ChatMode.LLAMA_4_SCOUT]: 1,
    [ChatMode.GPT_4o_Mini]: 1,
    [ChatMode.GPT_4_1]: 5,
    [ChatMode.GPT_4_1_Mini]: 2,
    [ChatMode.GPT_4_1_Nano]: 1,
    [ChatMode.O4_Mini]: 5,
    [ChatMode.CLAUDE_3_5_SONNET]: 5,
    [ChatMode.CLAUDE_3_7_SONNET]: 5,
    [ChatMode.GEMINI_2_FLASH]: 1,
    [ChatMode.GEMINI_2_5_FLASH]: 1,
    [ChatMode.DEEPSEEK_R1]: 5,
};

export const getChatModeName = (mode: ChatMode) => {
    switch (mode) {
        case ChatMode.Deep:
            return 'Deep Research';
        // case ChatMode.Pro:
        //     return 'Pro Search';
        case ChatMode.Agent:
            return 'Agent';
        case ChatMode.GEMINI_2_5_FLASH:
            return 'Gemini 2.5 Flash';
        case ChatMode.GPT_4_1:
            return 'GPT 4.1';
        case ChatMode.GPT_4_1_Mini:
            return 'GPT 4.1 Mini';
        case ChatMode.GPT_4_1_Nano:
            return 'GPT 4.1 Nano';
        case ChatMode.LLAMA_4_SCOUT:
            return 'Llama 4 Scout';
        case ChatMode.GPT_4o_Mini:
            return 'GPT 4o Mini';
        case ChatMode.CLAUDE_3_5_SONNET:
            return 'Claude 3.5 Sonnet';
        case ChatMode.CLAUDE_3_7_SONNET:
            return 'Claude 3.7 Sonnet';
        case ChatMode.O4_Mini:
            return 'O4 Mini';
        case ChatMode.DEEPSEEK_R1:
            return 'DeepSeek R1';
        case ChatMode.GEMINI_2_FLASH:
            return 'Gemini 2 Flash';
    }
};

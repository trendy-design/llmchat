import { useMcpToolsStore } from '@repo/common/store';

export const useMcpValidator = () => {
    const { mcpConfig, addMcpConfig, removeMcpConfig, updateSelectedMCP, selectedMCP } =
        useMcpToolsStore();

    const validateMcp = async (mcp: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mcp/validate`, {
            method: 'POST',
        });
        const data = await response.json();
        if (data.success) {
            addMcpConfig({
                []: {
                    tools: data.tools,
                    url: mcp,
                    status: 'success',
                },
            });
        }
    };

    return { validateMcp };
};

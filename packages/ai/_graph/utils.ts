import { ToolCallResultType } from "./types";

        export const processToolCallResult = (toolCallResult: ToolCallResultType) => {

                if("result" in toolCallResult) {
                return {
                        ...toolCallResult,
                        result: toolCallResult.result.map((r: any) => ({
                                title: r.title,
                                link: r.link,
                                content: r.content?.length,
                        })),
                };
        }
        return toolCallResult;
        };


        export const isValidUrl = (url: string) => {
                try {
                        new URL(url);
                        return true;
                } catch {
                        return false;
                }
        };
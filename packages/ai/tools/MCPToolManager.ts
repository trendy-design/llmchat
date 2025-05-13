import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { ToolCall, ToolResult } from '@repo/shared/types';
import { jsonSchema, tool, ToolSet } from 'ai';

export type MCPConfigValidationResult = {
    url: string;
    reachable: boolean;
    tools: string[];
    error?: string;
};

export type MCPServersConfig = Record<string, string>;

export class MCPToolManager {
    private clients: Client[] = [];
    private toolServerMap = new Map<string, Client>();
    private allTools: ToolSet = {};

    constructor(private config: MCPServersConfig) {}

    async initialize({
        shouldExecute = false,
    }: { shouldExecute?: boolean } = {}): Promise<boolean> {
        try {
            await this.connectToServers();
            await this.buildTools(shouldExecute);
            return true;
        } catch (error) {
            console.error('Failed to initialize MCPToolManager:', error);
            return false;
        }
    }

    private async connectToServers(): Promise<void> {
        for (const key in this.config) {
            const baseUrl = this.config[key];

            const client = new Client(
                {
                    name: key,
                    version: '0.1.0',
                },
                {
                    capabilities: {
                        sampling: {},
                    },
                }
            );

            try {
                await client.connect(new SSEClientTransport(new URL(this.config[key])));
                console.log(`Successfully connected to ${baseUrl}`);
                this.clients.push(client);
            } catch (error) {
                console.error(`Failed to connect to ${baseUrl}:`, error);
            }
        }
    }

    private async buildTools(shouldExecute = false): Promise<void> {
        await Promise.all(
            this.clients.map(async mcpClient => {
                let allMcpTools = [];
                let nextCursor: string | undefined = undefined;

                do {
                    const toolList = await mcpClient.listTools({
                        cursor: nextCursor,
                    });

                    nextCursor = toolList.nextCursor;

                    const mcpTools = toolList.tools.map(tool => {
                        this.toolServerMap.set(tool.name, mcpClient);
                        return {
                            name: tool.name,
                            description: tool.description,
                            input_schema: tool.inputSchema,
                        };
                    });

                    allMcpTools.push(...mcpTools);
                } while (nextCursor);

                const aiSdkTools = allMcpTools.map(t => {
                    if (shouldExecute) {
                        return {
                            name: t.name,
                            tool: tool({
                                parameters: jsonSchema(t.input_schema as any) as any,
                                description: t.description,
                                // execute: async args => {
                                //     return this.executeTool({
                                //         toolCallId: ,
                                //         toolName: t.name,
                                //         args,
                                //         type: 'tool-call',
                                //     });
                                // },
                            }),
                        };
                    }
                    return {
                        name: t.name,
                        tool: tool({
                            parameters: jsonSchema(t.input_schema as any) as any,
                            description: t.description,
                        }),
                    };
                });

                this.allTools = aiSdkTools?.reduce((acc, tool) => {
                    acc[tool.name] = tool.tool;
                    return acc;
                }, this.allTools);
            })
        );
    }

    getTools(): ToolSet {
        return this.allTools;
    }

    getToolServerMap(): Map<string, Client> {
        return this.toolServerMap;
    }

    close(): void {
        this.clients.forEach(client => {
            client.close();
        });
    }

    static async create(config: MCPServersConfig): Promise<MCPToolManager | undefined> {
        try {
            const manager = new MCPToolManager(config);
            const success = await manager.initialize();
            return success ? manager : undefined;
        } catch (error) {
            console.error('Error creating MCPToolManager:', error);
            return undefined;
        }
    }

    async executeTool(tool: ToolCall): Promise<ToolResult> {
        const client = this.toolServerMap.get(tool.toolName);

        if (!client) {
            throw new Error(`Tool "${tool.toolName}" not found or not properly mapped to a server`);
        }

        try {
            const result = await client.callTool({
                name: tool.toolName,
                arguments: tool.args,
            });

            return {
                result: result,
                type: 'tool-result',
                toolCallId: tool.toolCallId,
                toolName: tool.toolName,
            };
        } catch (error) {
            console.error(`Error executing tool "${tool.toolName}":`, error);
            throw error;
        }
    }

    static async validateConfig(url: string): Promise<MCPConfigValidationResult> {
        const results: MCPConfigValidationResult = {
            url,
            reachable: false,
            tools: [],
        };

        const client = new Client(
            {
                name: 'mcp-test',
                version: '0.1.0',
            },
            {
                capabilities: {
                    sampling: {},
                },
            }
        );
        try {
            await client.connect(new SSEClientTransport(new URL(url)));
            let allTools: string[] = [];
            let nextCursor: string | undefined = undefined;
            do {
                const toolList = await client.listTools({ cursor: nextCursor });
                nextCursor = toolList.nextCursor;
                allTools.push(...toolList.tools.map(t => t.name));
            } while (nextCursor);

            return {
                url,
                reachable: true,
                tools: allTools,
            };
        } catch (error: any) {
            return {
                url,
                reachable: false,
                tools: [],
                error: error?.message || String(error),
            };
        } finally {
            client.close();
        }
    }
}

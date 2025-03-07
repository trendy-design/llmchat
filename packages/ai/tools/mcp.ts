import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { jsonSchema, tool, ToolSet } from 'ai';



export type MCPServersConfig = {
        mcpServers: Record<string, string>
};


async function getMcpClients(config: MCPServersConfig): Promise<Client[]> {
        const clients: Client[] = [];

        for (const key in config.mcpServers) {
                const params = config.mcpServers[key];
                const client = new Client(
                        {
                                name: key,
                                version: '0.1.0',
                        
                        },
                        {
                                capabilities: {
                                        sampling: {},
                                },
                        },
                );

                await client.connect(new SSEClientTransport(new URL(params)));
                clients.push(client);
        }
        return clients;
}

export async function buildAllTools(config: MCPServersConfig): Promise<{ allTools: ToolSet, toolServerMap: Map<string, Client> } | undefined> {
        try {
                const mcpClients = await getMcpClients(config);
                let allTools: ToolSet = {};
                const toolServerMap = new Map();

        for (let i = 0; i < mcpClients.length; i++) {
                const mcpClient = mcpClients[i];

                const toolList = await mcpClient.listTools();
                const mcpTools = toolList.tools.map((tool) => {
                        toolServerMap.set(tool.name, mcpClient);
                        return {
                                name: tool.name,
                                description: tool.description,
                                input_schema: tool.inputSchema,
                        };
                });
                

                const aiSdkTools = mcpTools.map((t) => {

                        console.log(t.input_schema)
                        return {
                                name: t.name,
                                tool: tool({
                                        parameters: jsonSchema(t.input_schema as any) as any,
                                        description: t.description,
                                        execute: async (args) => {
                                        const result = await mcpClient.callTool({
                                                name: t.name,
                                                arguments: args,
                                        });
                                        return result;
                                }
                        })}
                });

                allTools = aiSdkTools?.reduce((acc, tool) => {
                        acc[tool.name] = tool.tool;
                        return acc;
                }, allTools);
                return { allTools, toolServerMap };
        }

        } catch (error) {
                console.error('Error building tools:', error);
                throw error;    
        }

}

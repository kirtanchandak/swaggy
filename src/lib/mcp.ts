import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { jsonSchema, tool, type Tool } from 'ai';
import { FOOD_MCP_URL } from '@/lib/agent';

type McpToolSet = Record<string, Tool>;

export type SwiggyMcpClient = {
  tools: () => Promise<McpToolSet>;
  close: () => Promise<void>;
};

/**
 * Swiggy MCP speaks Streamable HTTP (not legacy SSE).
 * Use the official MCP SDK transport + Client so protocol versions negotiate correctly.
 */
export async function createSwiggyFoodMcpClient(
  accessToken: string
): Promise<SwiggyMcpClient> {
  const transport = new StreamableHTTPClientTransport(new URL(FOOD_MCP_URL), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const client = new Client({ name: 'swaggy', version: '1.0.0' });
  await client.connect(transport);

  return {
    async tools() {
      const { tools: listed } = await client.listTools();
      const tools: McpToolSet = {};

      for (const listedTool of listed) {
        const { name, description, inputSchema } = listedTool;
        tools[name] = tool({
          description: description ?? name,
          parameters: jsonSchema({
            ...inputSchema,
            type: inputSchema.type ?? 'object',
            properties: inputSchema.properties ?? {},
            additionalProperties: false,
          }),
          execute: async (args, options) => {
            options.abortSignal?.throwIfAborted();
            return client.callTool({
              name,
              arguments: args as Record<string, unknown>,
            });
          },
        });
      }

      return tools;
    },
    async close() {
      await client.close();
    },
  };
}

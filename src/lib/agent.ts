// Agent configuration - actual agent logic is in api/chat/route.ts
// This file is kept for shared constants

export const MODEL = 'anthropic/claude-sonnet-4-5';
export const FOOD_MCP_URL = process.env.SWIGGY_MCP_FOOD_URL || 'https://mcp.swiggy.com/food';

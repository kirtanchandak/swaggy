import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createSwiggyFoodMcpClient } from '@/lib/mcp';
import { getSession, isAuthenticated } from '@/lib/session';

const SYSTEM_PROMPT = `You are Swaggy — a friendly conversational food ordering assistant powered by Swiggy. Help users order food through natural conversation.

## Your Workflow:
1. **Start**: Call get_addresses first — show the user their saved addresses and let them pick one
2. **Search**: Use search_restaurants or search_menu based on what they want
3. **Browse**: Use get_restaurant_menu to show a restaurant's menu
4. **Cart**: Use update_food_cart to add items, get_food_cart to show cart state
5. **Discount**: Use fetch_food_coupons then apply_food_coupon (COD-compatible only)
6. **Confirm**: Show full cart summary with breakdown before ANY order placement
7. **Order**: Only call place_food_order AFTER user explicitly says "yes", "confirm", "place it", etc.
8. **Track**: Use track_food_order to show delivery status

## CRITICAL Rules:
- ⚠️ NEVER place an order without explicit user confirmation showing cart items + total
- ⚠️ Cart is bound to ONE restaurant — warn user before switching (cart will clear)
- ⚠️ ₹1000 hard cap on orders — warn when approaching
- ⚠️ Only apply coupons where requiresOnlinePayment = false (COD path)
- ⚠️ Always call get_food_cart before place_food_order to confirm cart state

## Confirmation Format (always use this before placing):
"Here's your order summary:

🛍️ **[Restaurant Name]**
[item × qty — ₹price]

Subtotal: ₹X
Delivery: ₹X  
Discount: -₹X (if coupon applied)
**Total: ₹X**

Shall I place this order? 👇"

## Style:
- Be warm, helpful, and concise
- Use ₹ for all prices
- Use emoji tastefully for food cards
- When listing restaurants, show: name, rating ⭐, delivery time 🕐, key cuisine
- Format cart as a clean breakdown
- For errors, be helpful and suggest alternatives`;

export async function POST(request: NextRequest) {
  let mcpClient: Awaited<ReturnType<typeof createSwiggyFoodMcpClient>> | null =
    null;

  try {
    // Check auth
    const session = await getSession();
    if (!isAuthenticated(session)) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const accessToken = session.swiggy!.accessToken;
    const { messages } = await request.json();

    // Create OpenRouter-compatible client via OpenAI provider
    const openrouter = createOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    // Swiggy MCP is Streamable HTTP — legacy SSE GET gets 405
    mcpClient = await createSwiggyFoodMcpClient(accessToken);
    const mcpTools = await mcpClient.tools();

    // Stream response with Swiggy MCP tools
    const result = await streamText({
      model: openrouter('nvidia/nemotron-3-ultra-550b-a55b:free'),
      system: SYSTEM_PROMPT,
      messages,
      tools: mcpTools,
      maxSteps: 10,
      onFinish: async () => {
        if (mcpClient) {
          try { await mcpClient.close(); } catch { /* ignore */ }
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);
    if (mcpClient) {
      try { await mcpClient.close(); } catch { /* ignore */ }
    }

    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('401')) {
      return NextResponse.json(
        { error: 'Session expired — please reconnect your Swiggy account.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import { createSwiggyFoodMcpClient } from '@/lib/mcp';
import { getSession, isAuthenticated } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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
  let mcpClient: Awaited<ReturnType<typeof createSwiggyFoodMcpClient>> | null = null;

  try {
    // Check auth
    const session = await getSession();
    if (!isAuthenticated(session)) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const accessToken = session.swiggy!.accessToken;
    const userId = session.userId;
    
    const { messages, chatId: clientChatId } = await request.json();
    
    // Ensure chatId exists
    const chatId = clientChatId || uuidv4();
    
    let userPreferences = '';
    
    if (userId) {
      // Ensure the user exists in the database before adding chats (due to foreign key constraints)
      const { error: userError } = await supabase.from('users').upsert({ 
        id: userId,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id', ignoreDuplicates: false });
      
      if (userError) console.error('Failed to upsert user:', userError);

      const isNewChat = messages.length === 1;
      const title = isNewChat ? messages[0].content.slice(0, 50) + (messages[0].content.length > 50 ? '...' : '') : undefined;
      
      const chatPayload: Record<string, unknown> = {
        id: chatId,
        user_id: userId,
        updated_at: new Date().toISOString()
      };
      
      if (isNewChat && title) {
        chatPayload.title = title;
      }

      // Upsert the chat session
      await supabase.from('chats').upsert(chatPayload, { onConflict: 'id' });
      
      // Save the latest incoming user message
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.role === 'user') {
        await supabase.from('messages').insert({
          id: latestMessage.id || uuidv4(),
          chat_id: chatId,
          role: 'user',
          content: latestMessage.content
        });
      }

      // Fetch user preferences
      const { data: userData } = await supabase.from('users').select('preferences').eq('id', userId).single();
      if (userData?.preferences) {
        userPreferences = userData.preferences;
      }
    }

    const dynamicSystemPrompt = userPreferences
      ? `${SYSTEM_PROMPT}\n\n## User Preferences (REMEMBER THIS):\n${userPreferences}`
      : SYSTEM_PROMPT;

    // Create OpenRouter-compatible client via OpenAI provider
    const openrouter = createOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    // Swiggy MCP is Streamable HTTP — legacy SSE GET gets 405
    mcpClient = await createSwiggyFoodMcpClient(accessToken);
    const mcpTools = await mcpClient.tools();
    
    // Combine Swiggy MCP tools with our custom memory tool
    const allTools = {
      ...mcpTools,
      remember_preferences: tool({
        description: 'Call this tool when the user explicitly mentions a long-term food preference, allergy, dietary restriction, or favorite that you should remember for future conversations.',
        parameters: z.object({
          preference: z.string().describe('The preference to remember (e.g. "I am vegetarian", "I am allergic to peanuts", "I prefer spicy food")')
        }),
        execute: async ({ preference }) => {
          if (!userId) return "Cannot save preference: user not logged in.";
          
          const { data } = await supabase.from('users').select('preferences').eq('id', userId).single();
          const currentPrefs = data?.preferences || '';
          const newPrefs = currentPrefs ? `${currentPrefs}\n- ${preference}` : `- ${preference}`;
          
          await supabase.from('users').upsert({
            id: userId,
            preferences: newPrefs,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
          
          return `Successfully remembered: ${preference}`;
        }
      })
    };

    // Stream response with Swiggy MCP tools
    const result = await streamText({
      model: openrouter('openrouter/free'),
      system: dynamicSystemPrompt,
      messages,
      tools: allTools,
      maxSteps: 10,
      onError: ({ error }) => {
        console.error('🔥 StreamText Error:', error);
      },
      onFinish: async (completion) => {
        if (mcpClient) {
          try { await mcpClient.close(); } catch { /* ignore */ }
        }
        
        // Save the assistant's response to Supabase
        if (userId && completion.text) {
          const { error: assistantMsgError } = await supabase.from('messages').insert({
            id: uuidv4(),
            chat_id: chatId,
            role: 'assistant',
            content: completion.text,
            tool_invocations: completion.toolCalls
          });
          if (assistantMsgError) console.error('Error saving assistant message:', assistantMsgError);
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('🔥 Chat Route Error:', error);
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
      { error: message },
      { status: 500 }
    );
  }
}

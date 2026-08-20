import { NextRequest, NextResponse } from 'next/server';
import { getSession, isAuthenticated } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!isAuthenticated(session) || !session.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;

  // First verify the chat belongs to the user
  const { data: chatData, error: chatError } = await supabase
    .from('chats')
    .select('id')
    .eq('id', id)
    .eq('user_id', session.userId)
    .single();

  if (chatError || !chatData) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  // Fetch messages
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', id)
    .order('created_at', { ascending: true });

  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }

  // Transform messages to match ai/react format
  const formattedMessages = messages.map(m => ({
    id: m.id,
    role: m.role,
    content: m.content,
    ...(m.tool_invocations ? { toolInvocations: m.tool_invocations } : {})
  }));

  return NextResponse.json(formattedMessages);
}

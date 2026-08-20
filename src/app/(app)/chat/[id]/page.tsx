import { notFound, redirect } from 'next/navigation';
import { getSession, isAuthenticated } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default async function ExistingChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!isAuthenticated(session) || !session.userId) {
    redirect('/');
  }

  const { id } = await params;

  // Verify chat ownership
  const { data: chatData, error: chatError } = await supabase
    .from('chats')
    .select('id')
    .eq('id', id)
    .eq('user_id', session.userId)
    .single();

  if (chatError || !chatData) {
    notFound();
  }

  // Fetch messages
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', id)
    .order('created_at', { ascending: true });

  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
    // Render empty chat if error, or throw
    return <ChatInterface chatId={id} initialMessages={[]} />;
  }

  // Transform messages to match ai/react format
  const initialMessages = messages.map(m => ({
    id: m.id,
    role: m.role as 'user' | 'assistant' | 'system' | 'data',
    content: m.content,
    ...(m.tool_invocations ? { toolInvocations: m.tool_invocations } : {})
  }));

  return <ChatInterface chatId={id} initialMessages={initialMessages} />;
}

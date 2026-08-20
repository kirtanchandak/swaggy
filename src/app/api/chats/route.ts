import { NextResponse } from 'next/server';
import { getSession, isAuthenticated } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await getSession();
  if (!isAuthenticated(session) || !session.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('chats')
    .select('id, title, updated_at')
    .eq('user_id', session.userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }

  return NextResponse.json(data);
}

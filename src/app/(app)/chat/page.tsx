'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function NewChatPage() {
  const [chatId] = useState(() => uuidv4());
  
  return <ChatInterface chatId={chatId} />;
}

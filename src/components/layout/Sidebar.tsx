'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Plus, User } from 'lucide-react';

interface Chat {
  id: string;
  title: string | null;
  updated_at: string;
}

export function Sidebar() {
  const [chats, setChats] = useState<Chat[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/chats')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setChats(data); })
      .catch(console.error);
  }, [pathname]);

  return (
    <div style={{
      width: '16rem',
      background: 'var(--color-paper-2)',
      borderRight: '1px solid var(--color-rule)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: 'var(--font-body)',
    }}>
      {/* New chat button */}
      <div style={{ padding: 'var(--space-4)' }}>
        <Link
          href="/chat"
          id="sidebar-new-chat"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-accent-dim)',
            border: '1px solid oklch(65% 0.22 35 / 0.25)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background var(--dur-base) var(--ease-out)',
          }}
        >
          <Plus size={15} aria-hidden="true" />
          New Chat
        </Link>
      </div>

      {/* Chat history list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-2) var(--space-4)' }}>
        <div style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 500,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: 'var(--color-neutral)',
          padding: 'var(--space-4) var(--space-3) var(--space-2)',
        }}>
          Recent
        </div>
        {chats.length === 0 && (
          <div style={{ padding: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-neutral)', textAlign: 'center' }}>
            No chats yet
          </div>
        )}
        {chats.map(chat => {
          const isActive = pathname === `/chat/${chat.id}`;
          return (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              id={`sidebar-chat-${chat.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                fontSize: 'var(--text-sm)',
                color: isActive ? 'var(--color-ink)' : 'var(--color-muted)',
                background: isActive ? 'var(--color-paper-3)' : 'transparent',
                transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
                marginBottom: '2px',
              }}
            >
              <MessageSquare size={14} style={{ flexShrink: 0, opacity: 0.6 }} aria-hidden="true" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {chat.title || 'New Conversation'}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Profile link */}
      <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-rule)' }}>
        <Link
          href="/profile"
          id="sidebar-profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none',
            fontSize: 'var(--text-sm)',
            color: pathname === '/profile' ? 'var(--color-ink)' : 'var(--color-muted)',
            background: pathname === '/profile' ? 'var(--color-paper-3)' : 'transparent',
            transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
          }}
        >
          <div style={{
            width: '1.5rem',
            height: '1.5rem',
            borderRadius: '50%',
            background: 'var(--color-paper-3)',
            border: '1px solid var(--color-rule)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <User size={12} aria-hidden="true" />
          </div>
          <span style={{ fontWeight: 500 }}>My Profile</span>
        </Link>
      </div>
    </div>
  );
}


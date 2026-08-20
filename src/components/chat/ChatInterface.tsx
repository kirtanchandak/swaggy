'use client';

import { useChat, Message } from 'ai/react';
import { useEffect, useRef, useState, FormEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Send, Sparkles, Home } from 'lucide-react';
import { ChatMessage } from '@/components/ui/ChatMessage';

const SUGGESTIONS = [
  '🍛 Biryani under ₹400',
  '🥗 Vegetarian options',
  '🍕 Best rated nearby',
  '🛒 Show my cart',
  '📦 Track my order',
  '💸 Apply best coupon',
];


interface ChatInterfaceProps {
  chatId: string;
  initialMessages?: Message[];
}

export function ChatInterface({ chatId, initialMessages = [] }: ChatInterfaceProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(initialMessages.length === 0);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setInput,
  } = useChat({
    api: '/api/chat',
    body: { chatId },
    initialMessages,
    onError: (err: Error) => {
      if (err.message?.includes('401') || err.message?.includes('authenticated')) {
        router.push('/?error=session_expired');
      }
    },
  });

  // Auth check
  useEffect(() => {
    fetch('/api/auth/status')
      .then(r => r.json())
      .then((data: { authenticated: boolean }) => {
        if (!data.authenticated) {
          router.push('/');
        } else {
          setAuthChecked(true);
        }
      })
      .catch(() => router.push('/'));
  }, [router]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Hide suggestions after first message
  useEffect(() => {
    if (messages.length > 0) setShowSuggestions(false);
  }, [messages.length]);

  // Auto-resize textarea
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
        if (inputRef.current) inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleSuggestion = (s: string) => {
    // Strip leading emoji + space for the prompt, but keep it in UI
    const text = s.replace(/^[\p{Emoji}]+ /u, '');
    setInput(text);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-swiggy-primary animate-bounce" />
          <div className="w-2.5 h-2.5 rounded-full bg-swiggy-primary animate-bounce delay-150" />
          <div className="w-2.5 h-2.5 rounded-full bg-swiggy-primary animate-bounce delay-300" />
        </div>
      </div>
    );
  }

  const lastMessage = messages[messages.length - 1];
  const lastIsAssistant = lastMessage?.role === 'assistant';
  const lastHasContent = Boolean(lastMessage?.content?.trim());
  const lastHasActiveTools =
    lastIsAssistant &&
    Boolean(
      (
        lastMessage as Message & {
          toolInvocations?: { state: string }[];
        }
      ).toolInvocations?.some(
        (t) => t.state === 'call' || t.state === 'partial-call'
      )
    );
  // Keep feedback up until text streams or a tool badge is visibly working.
  // Otherwise Thinking vanishes when an empty assistant message lands mid-step.
  const isAssistantThinking =
    isLoading && (!lastIsAssistant || (!lastHasContent && !lastHasActiveTools));

  return (
    <div className="atm-canvas" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Atmospheric header */}
      <header className="glass-header" style={{
        position: 'relative',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-6)',
        flexShrink: 0,
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          textDecoration: 'none',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-md)',
          fontWeight: 500,
          letterSpacing: '-0.025em',
          color: 'var(--color-ink)',
        }}>
          sw<span style={{ color: 'var(--color-accent)' }}>aggy</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'oklch(62% 0.14 140)',
            background: 'oklch(62% 0.14 140 / 0.1)',
            border: '1px solid oklch(62% 0.14 140 / 0.2)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-pill)',
          }}>
            <span style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: 'oklch(62% 0.14 140)',
              animation: 'pulse-dot 2.4s ease-in-out infinite',
            }} aria-hidden="true" />
            Connected
          </div>
          <Link href="/" style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-muted)',
            textDecoration: 'none',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            transition: 'color var(--dur-base)',
          }}>
            <Home size={14} />
          </Link>
        </div>
      </header>

      {/* Main Chat Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-8) var(--space-6) var(--space-24)', scrollBehavior: 'smooth' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-20) 0', textAlign: 'center' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-6)' }}>🍽️</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display-s)', fontWeight: 800, fontStyle: 'normal', letterSpacing: '-0.03em', color: 'var(--color-ink)', marginBottom: 'var(--space-4)', lineHeight: 1.1 }}>
                What are you craving?
              </h1>
              <p style={{ fontSize: 'var(--text-md)', color: 'var(--color-ink-dim)', maxWidth: '40ch', lineHeight: 1.6 }}>
                Tell me what you want to eat, your budget, or just say &quot;I&apos;m hungry&quot; and I&apos;ll handle the rest.
              </p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m: Message, index) => (
              <ChatMessage
                key={m.id}
                message={m}
                isStreaming={
                  isLoading &&
                  index === messages.length - 1 &&
                  m.role === 'assistant'
                }
              />
            ))}
          </AnimatePresence>

          {/* Thinking Indicator — stays until content or an active tool badge takes over */}
          <AnimatePresence>
            {isAssistantThinking && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex items-start w-full"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-strong)', color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
                  <Sparkles size={14} style={{ color: 'var(--color-accent)' }} />
                  <span>Thinking</span>
                  <span style={{ display: 'inline-flex', gap: '4px', marginLeft: '4px' }}>
                    <span className="loading-dot" style={{ width: 5, height: 5 }} />
                    <span className="loading-dot" style={{ width: 5, height: 5 }} />
                    <span className="loading-dot" style={{ width: 5, height: 5 }} />
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="error-banner"
              role="alert"
            >
              <span>⚠</span>
              {error.message || 'Something went wrong. Please try again.'}
            </motion.div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Floating Input Area */}
      <div style={{ background: 'linear-gradient(to top, var(--color-paper) 60%, transparent)', padding: 'var(--space-8) var(--space-6) var(--space-6)', position: 'relative', zIndex: 20 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {showSuggestions && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}
            >
              {SUGGESTIONS.map(s => (
                <button 
                  key={s} 
                  onClick={() => handleSuggestion(s)}
                  style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-pill)', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-strong)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', cursor: 'pointer', transition: 'color var(--dur-base), border-color var(--dur-base)' }}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim() && !isLoading) {
                handleSubmit(e);
                if (inputRef.current) inputRef.current.style.height = 'auto';
              }
            }}
            className="relative"
          >
            <div className="chat-input-panel" style={{ borderRadius: 'var(--radius-lg)', padding: 'var(--space-2)', display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="What are you craving? (Shift+Enter for new line)"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', color: 'var(--color-ink)', padding: 'var(--space-3) var(--space-4)', minHeight: '48px', maxHeight: '140px', fontSize: 'var(--text-base)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}
                rows={1}
                disabled={isLoading}
                aria-label="Chat input"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                id="chat-submit-btn"
                className="cta-primary"
                style={{ padding: 'var(--space-3)', flexShrink: 0, borderRadius: 'var(--radius-md)' }}
              >
                <Send size={18} aria-hidden="true" />
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-neutral)', letterSpacing: '0.04em' }}>
              Orders require explicit confirmation · ₹1000 limit
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

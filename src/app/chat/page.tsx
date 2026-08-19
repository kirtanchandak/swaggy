'use client';

import { useChat, Message } from 'ai/react';
import { useEffect, useRef, useState, FormEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Send, LogOut, Sparkles, Home } from 'lucide-react';
import { ChatMessage } from '@/components/ui/ChatMessage';

const SUGGESTIONS = [
  '🍛 Biryani under ₹400',
  '🥗 Vegetarian options',
  '🍕 Best rated nearby',
  '🛒 Show my cart',
  '📦 Track my order',
  '💸 Apply best coupon',
];

export default function ChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/');
    }
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
    <div className="flex flex-col h-screen bg-bg relative selection:bg-swiggy-primary/30">
      {/* Premium Glass Header */}
      <header className="absolute top-0 w-full z-20 flex items-center justify-between px-6 py-4 glass-header">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-swiggy-primary to-swiggy-light flex items-center justify-center shadow-lg shadow-swiggy-primary/20 group-hover:scale-105 transition-transform">
            <span className="text-xl">🧡</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            sw<span className="text-swiggy-primary">aggy</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-400 tracking-wide">Connected</span>
          </div>
          <button 
            onClick={handleLogout} 
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto pt-24 pb-36 px-4 md:px-8 scroll-smooth">
        <div className="max-w-[800px] mx-auto flex flex-col gap-8">
          
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-swiggy-primary/20 to-swiggy-light/5 border border-swiggy-primary/20 flex items-center justify-center text-4xl mb-6 shadow-[0_0_40px_rgba(255,82,0,0.1)]">
                🍽️
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                What are you craving?
              </h1>
              <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
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
                <div className="flex items-center gap-2 px-5 py-4 rounded-2xl rounded-bl-sm bg-surface-elevated border border-border-strong text-gray-400 text-[15px]">
                  <Sparkles className="w-4 h-4 text-swiggy-primary animate-pulse" />
                  <span>Thinking...</span>
                  <span className="inline-flex gap-1 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-swiggy-primary/70 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-swiggy-primary/70 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-swiggy-primary/70 animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[800px] mx-auto w-full"
            >
              <div className="px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                <span>⚠️</span>
                {error.message || 'Something went wrong. Please try again.'}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Floating Input Area */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-bg via-bg to-transparent pt-10 pb-6 px-4 md:px-8 z-20">
        <div className="max-w-[800px] mx-auto">
          {showSuggestions && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start"
            >
              {SUGGESTIONS.map(s => (
                <button 
                  key={s} 
                  onClick={() => handleSuggestion(s)}
                  className="px-4 py-2 rounded-full bg-surface-elevated border border-border-strong text-sm text-gray-300 hover:text-swiggy-primary hover:border-swiggy-primary/40 hover:bg-swiggy-primary/5 transition-all shadow-sm"
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
            <div className="glass-panel rounded-3xl p-2 flex items-end gap-2 focus-within:ring-2 focus-within:ring-swiggy-primary/30 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="What are you craving? (Shift+Enter for new line)"
                className="w-full bg-transparent border-none outline-none resize-none text-white px-4 py-3 min-h-[48px] max-h-[140px] text-[15px] placeholder:text-gray-500"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-swiggy-primary to-swiggy-light text-white shadow-lg shadow-swiggy-primary/25 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
            <div className="text-center mt-3 text-xs text-gray-500 font-medium tracking-wide">
              Orders require explicit confirmation • ₹1000 limit
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

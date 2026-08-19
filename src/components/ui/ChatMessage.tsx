'use client';

import { motion } from 'framer-motion';
import { Message } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';
import { ToolCallBadge } from './ToolCallBadge';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

type ToolInvocationPart = {
  type: 'tool-invocation';
  toolInvocation: {
    toolName: string;
    state: 'partial-call' | 'call' | 'result';
  };
};

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  // Extract tool invocations
  const toolParts: ToolInvocationPart[] = (message as Message & { toolInvocations?: { toolName: string; state: 'call' | 'result' | 'partial-call' }[] })
    .toolInvocations?.map((ti) => ({
      type: 'tool-invocation' as const,
      toolInvocation: ti,
    })) ?? [];

  const showBubble = Boolean(message.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "flex flex-col w-full max-w-[800px] mx-auto",
        isUser ? "items-end" : "items-start"
      )}
    >
      {/* Tool Call Indicators */}
      {!isUser && toolParts.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {toolParts.map((p, i) => (
            <ToolCallBadge 
              key={`${p.toolInvocation.toolName}-${i}`} 
              toolName={p.toolInvocation.toolName} 
              state={p.toolInvocation.state} 
            />
          ))}
        </div>
      )}

      {/* Message Bubble */}
      {showBubble && (
        <div 
          className={clsx(
            "px-5 py-4 rounded-2xl max-w-full overflow-hidden shadow-lg border",
            isUser 
              ? "bg-gradient-to-br from-swiggy-primary to-swiggy-light text-white rounded-br-sm border-transparent shadow-swiggy-primary/20" 
              : "bg-surface-elevated text-gray-200 rounded-bl-sm border-border-strong shadow-black/40"
          )}
        >
          {isUser ? (
            <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
          ) : (
            <div className="prose-custom max-w-none break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-0.5 align-middle bg-swiggy-primary/80 animate-pulse rounded-sm" />
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

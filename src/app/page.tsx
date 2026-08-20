'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Tag, Receipt, Truck, UtensilsCrossed, ArrowRight, MessageSquare } from 'lucide-react';

const FEATURES = [
  { icon: Search,           label: 'Find what you crave' },
  { icon: ShoppingBag,      label: 'Smart cart control' },
  { icon: Tag,              label: 'Auto-applied coupons' },
  { icon: Receipt,          label: 'Instant checkout' },
  { icon: Truck,            label: 'Live order tracking' },
  { icon: UtensilsCrossed,  label: 'Any cuisine, any mood' },
];

const PROMPTS = [
  '"Biryani under ₹400, highest rated"',
  '"Remove the cola, add extra raita"',
  '"Apply the best coupon available"',
  '"Where is my order right now?"',
  '"Spicy Thai, within 30 minutes"',
];

export default function LandingPage() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [promptIdx, setPromptIdx] = useState(0);

  useEffect(() => {
    fetch('/api/auth/status')
      .then(r => r.json())
      .then(data => setAuthStatus(data.authenticated ? 'authenticated' : 'unauthenticated'))
      .catch(() => setAuthStatus('unauthenticated'));

    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) setError(decodeURIComponent(err));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setPromptIdx(i => (i + 1) % PROMPTS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  if (authStatus === 'loading') {
    return (
      <div className="loading-screen">
        <div className="loading-dots">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
      </div>
    );
  }

  return (
    <div className="atm-canvas" style={{ minHeight: '100svh' }}>

      {/* ── N5 Floating pill nav ── */}
      <nav className="nav-pill" role="navigation" aria-label="Main navigation">
        <Link href="/" className="nav-wordmark" id="nav-wordmark">
          sw<span>aggy</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {authStatus === 'authenticated' && (
            <div className="nav-status" aria-label="Swiggy connected">
              <span className="nav-status-dot" aria-hidden="true" />
              Connected
            </div>
          )}

          {authStatus === 'authenticated' ? (
            <Link href="/chat" className="nav-cta" id="nav-go-to-chat">
              <MessageSquare size={14} aria-hidden="true" />
              Open Chat
            </Link>
          ) : (
            <a href="/api/auth/connect" className="nav-cta" id="nav-connect">
              Connect Swiggy
            </a>
          )}
        </div>
      </nav>

      {/* ── Marquee Hero fold ── */}
      <main className="marquee-fold" id="hero">
        
        {/* Eyebrow */}
        <motion.div
          className="marquee-label anim-fade-up"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
          aria-hidden="true"
        >
          AI-powered food ordering
        </motion.div>

        {/* H1 — display fills fold */}
        <motion.h1
          className="marquee-h1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0, 0, 0.2, 1] }}
        >
          Just say what you&apos;re{' '}
          <span className="accent-word">craving.</span>
        </motion.h1>

        {/* Sub copy */}
        <motion.p
          className="marquee-sub"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: [0, 0, 0.2, 1] }}
        >
          No app scrolling. No menu hunting. Swaggy talks to Swiggy — 
          from finding restaurants to placing your order in one conversation.
        </motion.p>

        {/* Rotating prompt strip */}
        <motion.div
          className="prompt-strip"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28, ease: [0, 0, 0.2, 1] }}
          aria-live="polite"
          aria-label="Example prompts"
        >
          <span className="prompt-cursor" aria-hidden="true" />
          <AnimatePresence mode="wait">
            <motion.span
              key={promptIdx}
              className="prompt-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              {PROMPTS[promptIdx]}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="alert"
          >
            <span aria-hidden="true">⚠</span>
            {error.replace(/_/g, ' ')}. Please try again.
          </motion.div>
        )}

        {/* CTA cluster */}
        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0, 0, 0.2, 1] }}
        >
          {authStatus === 'authenticated' ? (
            <Link href="/chat" className="cta-primary" id="cta-go-to-chat">
              Open Swaggy
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          ) : (
            <>
              <a href="/api/auth/connect" className="cta-primary" id="cta-connect">
                Connect Swiggy Account
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </>
          )}
        </motion.div>
      </main>

      {/* ── Below fold: feature strip ── */}
      <section className="feature-strip" aria-label="What Swaggy can do">
        <motion.div
          className="feature-grid"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
        >
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-item">
              <f.icon className="feature-icon" aria-hidden="true" />
              <span className="feature-label">{f.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Ft5 Statement footer ── */}
      <footer className="footer-statement" role="contentinfo">
        <p className="footer-line">
          Swaggy is an unofficial AI interface for Swiggy — built with the{' '}
          <a href="https://mcp.swiggy.com/builders/docs/" target="_blank" rel="noopener noreferrer">
            Swiggy MCP
          </a>
          .
        </p>
        <p className="footer-line" style={{ color: 'var(--color-rule)' }}>
          Orders require explicit confirmation · ₹1000 limit per order
        </p>
      </footer>

    </div>
  );
}

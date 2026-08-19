'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Search, ShoppingBag, Truck, Tag, Receipt, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: Search, label: 'Find exactly what you want' },
  { icon: ShoppingBag, label: 'Smart cart management' },
  { icon: Tag, label: 'Auto-applied coupons' },
  { icon: Receipt, label: 'Seamless checkout' },
  { icon: Truck, label: 'Real-time tracking' },
  { icon: UtensilsCrossed, label: 'Food at your fingertips' },
];

const EXAMPLES = [
  '"Find me biryani under ₹400"',
  '"What has the best rating nearby?"',
  '"Add 2 of that, remove the cola"',
  '"Apply the best coupon"',
  '"Where is my order?"',
];

export default function LandingPage() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [exampleIdx, setExampleIdx] = useState(0);

  useEffect(() => {
    fetch('/api/auth/status')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('unauthenticated');
        }
      })
      .catch(() => setAuthStatus('unauthenticated'));

    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) setError(decodeURIComponent(err));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setExampleIdx(i => (i + 1) % EXAMPLES.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-swiggy-primary animate-bounce" />
          <div className="w-2.5 h-2.5 rounded-full bg-swiggy-primary animate-bounce delay-150" />
          <div className="w-2.5 h-2.5 rounded-full bg-swiggy-primary animate-bounce delay-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-bg flex flex-col items-center justify-center overflow-hidden selection:bg-swiggy-primary/30">
      
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-swiggy-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-swiggy-light/5 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)] pointer-events-none" />

      {/* Glass Header */}
      <header className="absolute top-0 w-full z-20 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-swiggy-primary to-swiggy-light flex items-center justify-center shadow-lg shadow-swiggy-primary/20 group-hover:scale-105 transition-transform">
            <span className="text-xl">🧡</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            sw<span className="text-swiggy-primary">aggy</span>
          </span>
        </Link>
        
        <div>
          {authStatus === 'authenticated' ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-400 tracking-wide">Connected</span>
              </div>
              <Link
                href="/chat"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-swiggy-primary to-swiggy-light text-white text-sm font-semibold rounded-full shadow-md shadow-swiggy-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <span>Go to Chat</span>
                <MessageSquare className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <a
              href="/api/auth/connect"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-medium rounded-full transition-colors backdrop-blur-sm"
            >
              <span>Connect Swiggy</span>
            </a>
          )}
        </div>
      </header>

      <main className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center text-center pt-16">
        
        {/* Logo Icon in Hero */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-swiggy-primary to-swiggy-light flex items-center justify-center shadow-[0_0_30px_rgba(255,82,0,0.3)]">
            <span className="text-3xl">🧡</span>
          </div>
        </motion.div>

        {/* Hero Text */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6"
        >
          Order with <span className="bg-gradient-to-r from-swiggy-primary to-swiggy-light bg-clip-text text-transparent">Swag!</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Your personal AI food concierge. No scrolling through endless menus. Just say what you&apos;re craving, and we handle the rest.
        </motion.p>

        {/* Rotating Example */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="h-14 flex items-center justify-center px-6 mb-12 rounded-2xl bg-swiggy-primary/5 border border-swiggy-primary/20 text-swiggy-light/90 italic shadow-inner"
        >
          {EXAMPLES[exampleIdx]}
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
          >
            <span>⚠️</span>
            {error.replace(/_/g, ' ')}. Please try again.
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          {authStatus === 'authenticated' ? (
            <div className="flex flex-col items-center gap-3">
              <Link 
                href="/chat" 
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-swiggy-primary to-swiggy-light text-white font-semibold text-lg rounded-full shadow-[0_0_30px_rgba(255,82,0,0.3)] transition-transform hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-5 h-5 text-white/90" />
                <span>Go to Swaggy Chat</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Swiggy Connected & ready</span>
              </div>
            </div>
          ) : (
            <a 
              href="/api/auth/connect" 
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold text-lg rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-swiggy-primary to-swiggy-light opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 group-hover:text-white transition-colors">
                Connect Swiggy Account
              </span>
              <svg className="relative z-10 w-5 h-5 group-hover:text-white transition-colors" viewBox="0 0 60 60" fill="currentColor">
                <path fillRule="evenodd" d="M31.996 23.565v-6.216a.735.735 0 0 0-.731-.732.735.735 0 0 0-.733.732v7.302c0 .414.336.744.744.744h.714c10.374 0 11.454.54 10.806 2.73-.03.108-.066.21-.102.324a.98.98 0 0 1-.018.066c-2.724 8.214-10.092 18.492-12.27 21.432a.764.764 0 0 1-1.23 0c-1.314-1.776-4.53-6.24-7.464-11.304-.198-.462-.294-1.542 2.964-1.542h3.984c.222 0 .402.18.402.402v3.216c0 .384.282.738.666.768a.73.73 0 0 0 .582-.216.701.701 0 0 0 .216-.516v-4.362a.76.76 0 0 0-.756-.756h-8.052c-1.404 0-2.256-1.2-2.814-2.292-1.752-3.672-3.006-7.296-3.006-10.152 0-7.314 5.832-13.896 13.884-13.896 7.17 0 12.6 5.214 13.704 11.52.007.054.048.294.054.342.288 3.096-7.788 2.742-11.184 2.76a.357.357 0 0 1-.36-.36v.006Z" clipRule="evenodd"/>
              </svg>
            </a>
          )}
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 flex flex-wrap justify-center gap-4 max-w-2xl"
        >
          {FEATURES.map((f, i) => (
            <div 
              key={i} 
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface/50 border border-border-subtle text-sm text-gray-400 backdrop-blur-sm"
            >
              <f.icon className="w-4 h-4 text-swiggy-primary/80" />
              <span>{f.label}</span>
            </div>
          ))}
        </motion.div>

      </main>
    </div>
  );
}


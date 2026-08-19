'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const FEATURES = [
  { icon: '🔍', label: 'Search restaurants' },
  { icon: '⚖️', label: 'Compare options' },
  { icon: '🛒', label: 'Manage cart' },
  { icon: '🏷️', label: 'Auto-apply coupons' },
  { icon: '📦', label: 'Place orders' },
  { icon: '🛵', label: 'Track delivery' },
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
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/status')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          router.push('/chat');
        } else {
          setAuthStatus('unauthenticated');
        }
      })
      .catch(() => setAuthStatus('unauthenticated'));

    // Check URL for error param
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) setError(decodeURIComponent(err));
  }, [router]);

  // Rotate example messages
  useEffect(() => {
    const id = setInterval(() => {
      setExampleIdx(i => (i + 1) % EXAMPLES.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  if (authStatus === 'loading') {
    return (
      <div className="landing-bg">
        <div className="thinking-dots">
          <div className="thinking-dot" />
          <div className="thinking-dot" />
          <div className="thinking-dot" />
        </div>
      </div>
    );
  }

  return (
    <div className="landing-bg">
      <div className="grid-pattern" />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 620, padding: '0 24px' }}>
        {/* Badge */}
        <div className="hero-badge">
          <span>✦</span>
          <span>Powered by Swiggy MCP</span>
        </div>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <div className="swiggy-logo">
            <div className="logo-icon">🧡</div>
            <span className="logo-text">sw<span>aggy</span></span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="hero-title">
          Swiggy, but you
          <br />
          <span className="highlight">just talk.</span>
        </h1>

        <p className="hero-subtitle">
          Search, compare, order, and track food on Swiggy — 
          through a single conversational interface.
          No buttons. No menus. Just say what you want.
        </p>

        {/* Rotating example */}
        <div style={{
          marginBottom: 36,
          padding: '12px 20px',
          background: 'rgba(255, 82, 0, 0.06)',
          border: '1px solid rgba(255, 82, 0, 0.15)',
          borderRadius: 12,
          fontSize: 15,
          color: 'var(--text-secondary)',
          minHeight: 46,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          fontStyle: 'italic',
        }}>
          {EXAMPLES[exampleIdx]}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 20,
            padding: '10px 16px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 10,
            fontSize: 14,
            color: '#f87171',
          }}>
            ⚠️ {error.replace(/_/g, ' ')}. Please try again.
          </div>
        )}

        {/* CTA */}
        <a href="/api/auth/connect" className="connect-btn">
          <svg width="22" height="22" viewBox="0 0 60 60" fill="none">
            <path fill="#fff" fillRule="evenodd" d="M31.996 23.565v-6.216a.735.735 0 0 0-.731-.732.735.735 0 0 0-.733.732v7.302c0 .414.336.744.744.744h.714c10.374 0 11.454.54 10.806 2.73-.03.108-.066.21-.102.324a.98.98 0 0 1-.018.066c-2.724 8.214-10.092 18.492-12.27 21.432a.764.764 0 0 1-1.23 0c-1.314-1.776-4.53-6.24-7.464-11.304-.198-.462-.294-1.542 2.964-1.542h3.984c.222 0 .402.18.402.402v3.216c0 .384.282.738.666.768a.73.73 0 0 0 .582-.216.701.701 0 0 0 .216-.516v-4.362a.76.76 0 0 0-.756-.756h-8.052c-1.404 0-2.256-1.2-2.814-2.292-1.752-3.672-3.006-7.296-3.006-10.152 0-7.314 5.832-13.896 13.884-13.896 7.17 0 12.6 5.214 13.704 11.52.007.054.048.294.054.342.288 3.096-7.788 2.742-11.184 2.76a.357.357 0 0 1-.36-.36v.006Z" clipRule="evenodd"/>
          </svg>
          Connect Swiggy Account
        </a>

        <p style={{ marginTop: 14, fontSize: 13, color: 'var(--text-muted)' }}>
          Uses OAuth 2.1 • Your password is never shared
        </p>

        {/* Features */}
        <div className="feature-row">
          {FEATURES.map(f => (
            <div className="feature-pill" key={f.label}>
              <span className="feature-pill-icon">{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

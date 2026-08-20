import { redirect } from 'next/navigation';
import { getSession, isAuthenticated } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default async function ProfilePage() {
  const session = await getSession();
  if (!isAuthenticated(session) || !session.userId) {
    redirect('/');
  }

  const { data } = await supabase
    .from('users')
    .select('preferences')
    .eq('id', session.userId)
    .single();

  const preferences = data?.preferences || null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflowY: 'auto',
      padding: 'var(--space-12) var(--space-8)',
      fontFamily: 'var(--font-body)',
      color: 'var(--color-ink)',
      background: 'var(--color-paper)',
    }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            fontWeight: 400,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}>
            <span style={{ display: 'block', width: '1.5rem', height: '1px', background: 'var(--color-accent)', opacity: 0.5 }} />
            Account
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 800,
            fontStyle: 'normal',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--color-ink)',
            margin: 0,
          }}>
            My Profile
          </h1>
          <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-ink-dim)', fontSize: 'var(--text-base)', lineHeight: 1.6 }}>
            Manage your Swaggy account and remembered preferences.
          </p>
        </div>

        {/* Preferences Section */}
        <section style={{ marginBottom: 'var(--space-12)' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            fontWeight: 700,
            fontStyle: 'normal',
            letterSpacing: '-0.02em',
            color: 'var(--color-ink)',
            marginBottom: 'var(--space-4)',
          }}>
            Remembered Preferences
          </h2>
          <div style={{
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-paper-2)',
            border: '1px solid var(--color-rule)',
            color: preferences ? 'var(--color-ink-dim)' : 'var(--color-neutral)',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            fontSize: 'var(--text-base)',
          }}>
            {preferences || 'Nothing remembered yet. Start chatting and tell Swaggy what you like — it will automatically learn your preferences.'}
          </div>
          <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral)' }}>
            Say &quot;remember I&apos;m vegetarian&quot; or &quot;forget my nut allergy&quot; anytime in chat to update these.
          </p>
        </section>

        {/* Account Section */}
        <section style={{
          paddingTop: 'var(--space-8)',
          borderTop: '1px solid var(--color-rule)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            fontWeight: 700,
            fontStyle: 'normal',
            letterSpacing: '-0.02em',
            color: 'var(--color-ink)',
            marginBottom: 'var(--space-4)',
          }}>
            Swiggy Connection
          </h2>
          <div style={{
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-paper-2)',
            border: '1px solid var(--color-rule)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'oklch(62% 0.14 140)',
                animation: 'pulse-dot 2.4s ease-in-out infinite',
                flexShrink: 0,
              }} aria-hidden="true" />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-dim)' }}>
                Your Swiggy account is connected and ready to order.
              </span>
            </div>
            <LogoutButton />
          </div>
        </section>

      </div>
    </div>
  );
}

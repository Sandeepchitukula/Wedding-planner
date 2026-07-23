'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/vendors', label: 'Vendors' },
  { href: '/budget', label: 'Budget' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/guests', label: 'Guests' },
  { href: '/team', label: 'Team' },
];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(undefined);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else setSent(true);
  }

  if (session === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-ink/60">Loading…</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="temple-card w-full max-w-sm p-8 mt-8">
          <h1 className="font-serif text-3xl text-maroon text-center mb-1">Wedding Planner</h1>
          <p className="text-center text-sm text-ink/60 mb-6">Sign in to manage the wedding</p>
          {sent ? (
            <p className="text-sm text-leaf text-center">Check your email for a sign-in link.</p>
          ) : (
            <form onSubmit={sendLink} className="space-y-3">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gold/40 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <button className="w-full bg-maroon text-paper rounded py-2 font-medium hover:bg-maroondeep transition">
                Send sign-in link
              </button>
              {error && <p className="text-sm text-kumkum">{error}</p>}
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-maroon text-paper sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-serif text-xl tracking-wide">Wedding Planner</span>
          <button onClick={() => setNavOpen(!navOpen)} className="text-2xl leading-none" aria-label="Menu">
            {navOpen ? '×' : '☰'}
          </button>
        </div>
        {navOpen && (
          <nav className="pb-2 px-2 flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setNavOpen(false)}
                className={`px-3 py-2 rounded text-sm ${pathname === item.href ? 'bg-goldlight/30 font-semibold' : 'hover:bg-white/10'}`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-left px-3 py-2 rounded text-sm text-kumkum/90 hover:bg-white/10 mt-1"
            >
              Sign out
            </button>
          </nav>
        )}
      </header>
      <nav className="hidden md:flex gap-1 px-4 py-2 border-b border-gold/30 bg-white/60 overflow-x-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1.5 rounded text-sm whitespac

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Task, Vendor, BudgetItem, Guest, WeddingEvent } from '@/lib/types';

export default function Dashboard() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [t, v, b, g, e] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('vendors').select('*'),
        supabase.from('budget_items').select('*'),
        supabase.from('guests').select('*'),
        supabase.from('events').select('*').order('event_date'),
      ]);
      setTasks(t.data || []);
      setVendors(v.data || []);
      setBudget(b.data || []);
      setGuests(g.data || []);
      setEvents(e.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const taskPct = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const upcomingTasks = tasks
    .filter((t) => t.status !== 'done' && t.due_date)
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
    .slice(0, 5);

  const totalEstimated = budget.reduce((s, i) => s + (i.estimated_cost || 0), 0);
  const totalPaid = budget.reduce((s, i) => s + (i.paid_amount || 0), 0);
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const vendorBooked = vendors.filter((v) => v.status === 'booked' || v.status === 'paid').length;
  const totalHeads = guests.reduce((s, g) => s + (g.headcount || 1), 0);
  const confirmedHeads = guests.filter((g) => g.rsvp_status === 'confirmed').reduce((s, g) => s + (g.headcount || 1), 0);

  const today = new Date().toISOString().slice(0, 10);
  const nextEvent = events.find((e) => e.event_date >= today);

  if (loading) return <p className="text-ink/50">Loading…</p>;

  return (
    <div>
      <h1 className="font-serif text-3xl text-maroon mb-1">Dashboard</h1>
      <p className="text-sm text-ink/60 mb-5">Everything, at a glance.</p>

      {nextEvent && (
        <div className="temple-card p-4 mb-5 mt-4 bg-maroon/5 border-maroon/20">
          <p className="text-xs text-gold uppercase tracking-wide mb-1">Next up</p>
          <p className="font-serif text-lg text-maroon">{nextEvent.name}</p>
          <p className="text-sm text-ink/60">
            {new Date(nextEvent.event_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            {nextEvent.start_time && ` · ${nextEvent.start_time.slice(0,5)}`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Link href="/tasks" className="temple-card p-4 mt-4 block">
          <p className="text-xs text-ink/50 mb-1">Tasks done</p>
          <p className="font-serif text-2xl text-maroon">{taskPct}%</p>
          <p className="text-xs text-ink/50">{doneTasks} of {tasks.length}</p>
        </Link>
        <Link href="/vendors" className="temple-card p-4 mt-4 block">
          <p className="text-xs text-ink/50 mb-1">Vendors locked</p>
          <p className="font-serif text-2xl text-maroon">{vendorBooked}/{vendors.length}</p>
          <p className="text-xs text-ink/50">booked or paid</p>
        </Link>
        <Link href="/budget" className="temple-card p-4 mt-4 block">
          <p className="text-xs text-ink/50 mb-1">Budget paid</p>
          <p className="font-serif text-2xl text-leaf">{fmt(totalPaid)}</p>
          <p className="text-xs text-ink/50">of {fmt(totalEstimated)} estimated</p>
        </Link>
        <Link href="/guests" className="temple-card p-4 mt-4 block">
          <p className="text-xs text-ink/50 mb-1">Guests confirmed</p>
          <p className="font-serif text-2xl text-maroon">{confirmedHeads}/{totalHeads}</p>
          <p className="text-xs text-ink/50">people</p>
        </Link>
      </div>

      <h2 className="font-serif text-lg text-maroon mb-2">Upcoming tasks</h2>
      {upcomingTasks.length === 0 ? (
        <p className="text-sm text-ink/50 mb-4">Nothing due soon — or nothing scheduled yet.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {upcomingTasks.map((t) => (
            <div key={t.id} className="temple-card p-3 mt-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{t.title}</p>
                <p className="text-xs text-ink/50">{t.category} · due {t.due_date}</p>
              </div>
              <span className={`status-${t.status} text-xs rounded-full px-2 py-1 capitalize`}>{t.status.replace('_',' ')}</span>
            </div>
          ))}
        </div>
      )}
      <Link href="/tasks" className="text-sm text-gold underline">View all tasks →</Link>
    </div>
  );
}

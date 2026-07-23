'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { WeddingEvent, TeamMember } from '@/lib/types';

export default function TimelinePage() {
  const supabase = createClient();
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', event_date: '', start_time: '', end_time: '', location: '', responsible: '', description: '',
  });

  async function load() {
    const [e, t] = await Promise.all([
      supabase.from('events').select('*').order('event_date').order('start_time'),
      supabase.from('team_members').select('*').order('name'),
    ]);
    setEvents(e.data || []);
    setTeam(t.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from('events').insert([{
      ...form,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      responsible: form.responsible || null,
    }]);
    setForm({ name: '', event_date: '', start_time: '', end_time: '', location: '', responsible: '', description: '' });
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    await supabase.from('events').delete().eq('id', id);
    load();
  }

  const teamName = (id: string | null) => team.find((t) => t.id === id)?.name || null;

  const grouped = events.reduce((acc: Record<string, WeddingEvent[]>, ev) => {
    (acc[ev.event_date] = acc[ev.event_date] || []).push(ev);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-serif text-2xl text-maroon">Timeline</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-maroon text-paper rounded px-3 py-1.5 text-sm">
          {showForm ? 'Cancel' : '+ Add event'}
        </button>
      </div>
      <p className="text-sm text-ink/60 mb-4">The day-by-day schedule, ritual by ritual.</p>

      {showForm && (
        <form onSubmit={addEvent} className="temple-card p-4 mb-5 space-y-2 mt-4">
          <input required placeholder="Event name (e.g. Snathakam)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <input required type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <div className="grid grid-cols-2 gap-2">
            <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="border border-gold/40 rounded px-3 py-2" />
            <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="border border-gold/40 rounded px-3 py-2" />
          </div>
          <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <select value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2">
            <option value="">Responsible person…</option>
            {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <textarea placeholder="Notes" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <button className="bg-leaf text-white rounded px-4 py-2 text-sm">Save</button>
        </form>
      )}

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-ink/50">No events added yet.</p>
      ) : (
        Object.entries(grouped).map(([date, evs]) => (
          <div key={date} className="mb-5">
            <h2 className="font-serif text-lg text-gold border-b border-gold/40 pb-1 mb-2">
              {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <div className="space-y-2">
              {evs.map((ev) => (
                <div key={ev.id} className="temple-card p-3 mt-3 flex justify-between items-start">
                  <div>
                    <p className="font-medium">{ev.name} {ev.start_time && <span className="text-xs text-ink/50">· {ev.start_time.slice(0,5)}{ev.end_time && `–${ev.end_time.slice(0,5)}`}</span>}</p>
                    {ev.location && <p className="text-xs text-ink/50">{ev.location}</p>}
                    {teamName(ev.responsible) && <p className="text-xs text-ink/50">In charge: {teamName(ev.responsible)}</p>}
                    {ev.description && <p className="text-xs text-ink/50 italic mt-1">{ev.description}</p>}
                  </div>
                  <button onClick={() => remove(ev.id)} className="text-kumkum text-xs">Remove</button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
      }

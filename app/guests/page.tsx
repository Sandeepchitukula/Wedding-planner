'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Guest, TeamMember } from '@/lib/types';

const SIDES = ['bride', 'groom', 'both'];
const CATEGORIES = ['Family', 'Relatives', 'Friends', 'Colleagues', 'Neighbors', 'Other'];
const RSVP = ['pending', 'confirmed', 'declined'];

export default function GuestsPage() {
  const supabase = createClient();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', side: SIDES[0], category: CATEGORIES[0], headcount: '1',
    rsvp_status: 'pending', phone: '', invited_by: '', notes: '',
  });

  async function load() {
    const [g, t] = await Promise.all([
      supabase.from('guests').select('*').order('name'),
      supabase.from('team_members').select('*').order('name'),
    ]);
    setGuests(g.data || []);
    setTeam(t.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addGuest(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from('guests').insert([{
      ...form,
      headcount: Number(form.headcount) || 1,
      invited_by: form.invited_by || null,
    }]);
    setForm({ name: '', side: SIDES[0], category: CATEGORIES[0], headcount: '1', rsvp_status: 'pending', phone: '', invited_by: '', notes: '' });
    setShowForm(false);
    load();
  }

  async function updateRsvp(id: string, rsvp_status: string) {
    await supabase.from('guests').update({ rsvp_status }).eq('id', id);
    load();
  }

  async function remove(id: string) {
    await supabase.from('guests').delete().eq('id', id);
    load();
  }

  const totalHeads = guests.reduce((s, g) => s + (g.headcount || 1), 0);
  const confirmedHeads = guests.filter((g) => g.rsvp_status === 'confirmed').reduce((s, g) => s + (g.headcount || 1), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-serif text-2xl text-maroon">Guests</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-maroon text-paper rounded px-3 py-1.5 text-sm">
          {showForm ? 'Cancel' : '+ Add guest'}
        </button>
      </div>
      <p className="text-sm text-ink/60 mb-4">{totalHeads} invited so far · {confirmedHeads} confirmed</p>

      {showForm && (
        <form onSubmit={addGuest} className="temple-card p-4 mb-5 space-y-2 mt-4">
          <input required placeholder="Guest / family name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.side} onChange={(e) => setForm({ ...form, side: e.target.value })} className="border border-gold/40 rounded px-3 py-2 capitalize">
              {SIDES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border border-gold/40 rounded px-3 py-2">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Headcount" type="number" min="1" value={form.headcount} onChange={(e) => setForm({ ...form, headcount: e.target.value })} className="border border-gold/40 rounded px-3 py-2" />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-gold/40 rounded px-3 py-2" />
          </div>
          <select value={form.invited_by} onChange={(e) => setForm({ ...form, invited_by: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2">
            <option value="">Invited by…</option>
            {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <button className="bg-leaf text-white rounded px-4 py-2 text-sm">Save</button>
        </form>
      )}

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : guests.length === 0 ? (
        <p className="text-ink/50">No guests added yet.</p>
      ) : (
        <div className="space-y-2">
          {guests.map((g) => (
            <div key={g.id} className="temple-card p-3 mt-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{g.name} <span className="text-xs text-ink/50 capitalize">· {g.side} side · {g.category}</span></p>
                  <p className="text-xs text-ink/50">{g.headcount} {g.headcount > 1 ? 'people' : 'person'}{g.phone && ` · ${g.phone}`}</p>
                  {g.notes && <p className="text-xs text-ink/50 italic mt-1">{g.notes}</p>}
                </div>
                <button onClick={() => remove(g.id)} className="text-kumkum text-xs">Remove</button>
              </div>
              <select
                value={g.rsvp_status}
                onChange={(e) => updateRsvp(g.id, e.target.value)}
                className={`rsvp-${g.rsvp_status} mt-2 text-xs rounded-full px-2 py-1 border-none capitalize`}
              >
                {RSVP.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
                                                         }

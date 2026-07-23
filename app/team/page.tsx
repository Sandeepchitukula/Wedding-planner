'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { TeamMember } from '@/lib/types';

export default function TeamPage() {
  const supabase = createClient();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', phone: '', email: '' });
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from('team_members').select('*').order('name');
    setMembers(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from('team_members').insert([form]);
    setForm({ name: '', role: '', phone: '', email: '' });
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    await supabase.from('team_members').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-2xl text-maroon">Team</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-maroon text-paper rounded px-3 py-1.5 text-sm">
          {showForm ? 'Cancel' : '+ Add person'}
        </button>
      </div>
      <p className="text-sm text-ink/60 mb-4">Everyone here can be assigned tasks, vendors, or timeline items.</p>

      {showForm && (
        <form onSubmit={addMember} className="temple-card p-4 mb-5 space-y-2 mt-4">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <input placeholder="Role (e.g. Budget owner, Bride's side coordinator)" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <button className="bg-leaf text-white rounded px-4 py-2 text-sm">Save</button>
        </form>
      )}

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : members.length === 0 ? (
        <p className="text-ink/50">No one added yet.</p>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="temple-card p-3 mt-3 flex justify-between items-start">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-sm text-ink/60">{m.role}</p>
                <p className="text-xs text-ink/50">{[m.phone, m.email].filter(Boolean).join(' · ')}</p>
              </div>
              <button onClick={() => remove(m.id)} className="text-kumkum text-sm">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

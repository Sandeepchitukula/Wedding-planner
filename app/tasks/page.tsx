'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Task, TeamMember, Vendor } from '@/lib/types';

const STATUSES = ['pending', 'in_progress', 'done', 'blocked'];
const PRIORITIES = ['low', 'medium', 'high'];
const CATEGORIES = ['Rituals', 'Logistics', 'Attire', 'Invitations', 'Catering', 'Decoration', 'Guests', 'Other'];

export default function TasksPage() {
  const supabase = createClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    title: '', category: CATEGORIES[0], description: '', due_date: '',
    status: 'pending', priority: 'medium', assigned_to: '', vendor_id: '',
  });

  async function load() {
    const [t, tm, v] = await Promise.all([
      supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false }),
      supabase.from('team_members').select('*').order('name'),
      supabase.from('vendors').select('*'),
    ]);
    setTasks(t.data || []);
    setTeam(tm.data || []);
    setVendors(v.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from('tasks').insert([{
      ...form,
      due_date: form.due_date || null,
      assigned_to: form.assigned_to || null,
      vendor_id: form.vendor_id || null,
    }]);
    setForm({ title: '', category: CATEGORIES[0], description: '', due_date: '', status: 'pending', priority: 'medium', assigned_to: '', vendor_id: '' });
    setShowForm(false);
    load();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('tasks').update({ status }).eq('id', id);
    load();
  }

  async function remove(id: string) {
    await supabase.from('tasks').delete().eq('id', id);
    load();
  }

  const teamName = (id: string | null) => team.find((t) => t.id === id)?.name || null;
  const vendorName = (id: string | null) => vendors.find((v) => v.id === id)?.name || null;
  const visible = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-serif text-2xl text-maroon">Tasks</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-maroon text-paper rounded px-3 py-1.5 text-sm">
          {showForm ? 'Cancel' : '+ Add task'}
        </button>
      </div>
      <p className="text-sm text-ink/60 mb-3">Everything that needs to get done, who owns it, and by when.</p>

      <div className="flex gap-1 mb-4 overflow-x-auto">
        {['all', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap capitalize ${filter === s ? 'bg-maroon text-paper' : 'bg-white border border-gold/40 text-ink/70'}`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={addTask} className="temple-card p-4 mb-5 space-y-2 mt-4">
          <input required placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="border border-gold/40 rounded px-3 py-2" />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="border border-gold/40 rounded px-3 py-2">
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2">
            <option value="">Assign to…</option>
            {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={form.vendor_id} onChange={(e) => setForm({ ...form, vendor_id: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2">
            <option value="">Link a vendor (optional)…</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <button className="bg-leaf text-white rounded px-4 py-2 text-sm">Save</button>
        </form>
      )}

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-ink/50">No tasks here.</p>
      ) : (
        <div className="space-y-2">
          {visible.map((t) => (
            <div key={t.id} className="temple-card p-3 mt-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{t.title} {t.priority === 'high' && <span className="text-kumkum text-xs">● high</span>}</p>
                  <p className="text-xs text-ink/50">{t.category}{t.due_date && ` · due ${t.due_date}`}</p>
                  {(teamName(t.assigned_to) || vendorName(t.vendor_id)) && (
                    <p className="text-xs text-ink/50">
                      {teamName(t.assigned_to) && `Owner: ${teamName(t.assigned_to)}`}
                      {vendorName(t.vendor_id) && ` · Vendor: ${vendorName(t.vendor_id)}`}
                    </p>
                  )}
                  {t.description && <p className="text-xs text-ink/50 italic mt-1">{t.description}</p>}
                </div>
                <button onClick={() => remove(t.id)} className="text-kumkum text-xs">Remove</button>
              </div>
              <select
                value={t.status}
                onChange={(e) => updateStatus(t.id, e.target.value)}
                className={`status-${t.status} mt-2 text-xs rounded-full px-2 py-1 border-none capitalize`}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
                                                                  }

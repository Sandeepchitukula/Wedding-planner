'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Vendor, TeamMember } from '@/lib/types';

const STATUSES = ['enquired', 'shortlisted', 'booked', 'paid', 'cancelled'];
const CATEGORIES = ['Venue', 'Catering', 'Decoration', 'Photography', 'Priest', 'Music/DJ', 'Attire', 'Jewelry', 'Invitations', 'Transport', 'Other'];

export default function VendorsPage() {
  const supabase = createClient();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', category: CATEGORIES[0], contact_person: '', phone: '',
    status: 'enquired', cost_quoted: '', advance_paid: '', managed_by: '', notes: '',
  });

  async function load() {
    const [v, t] = await Promise.all([
      supabase.from('vendors').select('*').order('created_at', { ascending: false }),
      supabase.from('team_members').select('*').order('name'),
    ]);
    setVendors(v.data || []);
    setTeam(t.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addVendor(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from('vendors').insert([{
      ...form,
      cost_quoted: form.cost_quoted ? Number(form.cost_quoted) : null,
      advance_paid: form.advance_paid ? Number(form.advance_paid) : 0,
      managed_by: form.managed_by || null,
    }]);
    setForm({ name: '', category: CATEGORIES[0], contact_person: '', phone: '', status: 'enquired', cost_quoted: '', advance_paid: '', managed_by: '', notes: '' });
    setShowForm(false);
    load();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('vendors').update({ status }).eq('id', id);
    load();
  }

  async function remove(id: string) {
    await supabase.from('vendors').delete().eq('id', id);
    load();
  }

  const teamName = (id: string | null) => team.find((t) => t.id === id)?.name || '—';

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-serif text-2xl text-maroon">Vendors</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-maroon text-paper rounded px-3 py-1.5 text-sm">
          {showForm ? 'Cancel' : '+ Add vendor'}
        </button>
      </div>
      <p className="text-sm text-ink/60 mb-4">Track every vendor from first enquiry to final payment.</p>

      {showForm && (
        <form onSubmit={addVendor} className="temple-card p-4 mb-5 space-y-2 mt-4">
          <input required placeholder="Vendor name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input placeholder="Contact person" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Cost quoted (₹)" type="number" value={form.cost_quoted} onChange={(e) => setForm({ ...form, cost_quoted: e.target.value })} className="border border-gold/40 rounded px-3 py-2" />
            <input placeholder="Advance paid (₹)" type="number" value={form.advance_paid} onChange={(e) => setForm({ ...form, advance_paid: e.target.value })} className="border border-gold/40 rounded px-3 py-2" />
          </div>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={form.managed_by} onChange={(e) => setForm({ ...form, managed_by: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2">
            <option value="">Managed by…</option>
            {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <button className="bg-leaf text-white rounded px-4 py-2 text-sm">Save</button>
        </form>
      )}

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : vendors.length === 0 ? (
        <p className="text-ink/50">No vendors added yet.</p>
      ) : (
        <div className="space-y-2">
          {vendors.map((v) => (
            <div key={v.id} className="temple-card p-3 mt-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{v.name} <span className="text-xs text-ink/50">· {v.category}</span></p>
                  <p className="text-sm text-ink/60">{v.contact_person} {v.phone && `· ${v.phone}`}</p>
                  <p className="text-xs text-ink/50 mt-1">
                    {v.cost_quoted != null && `Quoted ₹${v.cost_quoted.toLocaleString('en-IN')}`}
                    {v.advance_paid ? ` · Advance ₹${v.advance_paid.toLocaleString('en-IN')}` : ''}
                    {v.managed_by && ` · Managed by ${teamName(v.managed_by)}`}
                  </p>
                  {v.notes && <p className="text-xs text-ink/50 italic mt-1">{v.notes}</p>}
                </div>
                <button onClick={() => remove(v.id)} className="text-kumkum text-xs">Remove</button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <select
                  value={v.status}
                  onChange={(e) => updateStatus(v.id, e.target.value)}
                  className={`vendor-${v.status} text-xs rounded-full px-2 py-1 border-none capitalize`}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
                    }

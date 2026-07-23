'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { BudgetItem, Vendor } from '@/lib/types';

const CATEGORIES = ['Venue', 'Catering', 'Decoration', 'Photography', 'Priest', 'Music/DJ', 'Attire', 'Jewelry', 'Invitations', 'Transport', 'Gifts', 'Other'];

export default function BudgetPage() {
  const supabase = createClient();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    category: CATEGORIES[0], item_name: '', estimated_cost: '', actual_cost: '', paid_amount: '', vendor_id: '', notes: '',
  });

  async function load() {
    const [b, v] = await Promise.all([
      supabase.from('budget_items').select('*').order('created_at', { ascending: false }),
      supabase.from('vendors').select('*'),
    ]);
    setItems(b.data || []);
    setVendors(v.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from('budget_items').insert([{
      ...form,
      estimated_cost: Number(form.estimated_cost) || 0,
      actual_cost: form.actual_cost ? Number(form.actual_cost) : null,
      paid_amount: form.paid_amount ? Number(form.paid_amount) : 0,
      vendor_id: form.vendor_id || null,
    }]);
    setForm({ category: CATEGORIES[0], item_name: '', estimated_cost: '', actual_cost: '', paid_amount: '', vendor_id: '', notes: '' });
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    await supabase.from('budget_items').delete().eq('id', id);
    load();
  }

  const totalEstimated = items.reduce((s, i) => s + (i.estimated_cost || 0), 0);
  const totalActual = items.reduce((s, i) => s + (i.actual_cost || i.estimated_cost || 0), 0);
  const totalPaid = items.reduce((s, i) => s + (i.paid_amount || 0), 0);
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-serif text-2xl text-maroon">Budget</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-maroon text-paper rounded px-3 py-1.5 text-sm">
          {showForm ? 'Cancel' : '+ Add item'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 my-4">
        <div className="temple-card p-3 mt-3 text-center">
          <p className="text-xs text-ink/50">Estimated</p>
          <p className="font-serif text-lg text-maroon">{fmt(totalEstimated)}</p>
        </div>
        <div className="temple-card p-3 mt-3 text-center">
          <p className="text-xs text-ink/50">Actual</p>
          <p className="font-serif text-lg text-maroon">{fmt(totalActual)}</p>
        </div>
        <div className="temple-card p-3 mt-3 text-center">
          <p className="text-xs text-ink/50">Paid</p>
          <p className="font-serif text-lg text-leaf">{fmt(totalPaid)}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={addItem} className="temple-card p-4 mb-5 space-y-2 mt-4">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input required placeholder="Item name" value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <div className="grid grid-cols-3 gap-2">
            <input placeholder="Estimated ₹" type="number" value={form.estimated_cost} onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })} className="border border-gold/40 rounded px-3 py-2" />
            <input placeholder="Actual ₹" type="number" value={form.actual_cost} onChange={(e) => setForm({ ...form, actual_cost: e.target.value })} className="border border-gold/40 rounded px-3 py-2" />
            <input placeholder="Paid ₹" type="number" value={form.paid_amount} onChange={(e) => setForm({ ...form, paid_amount: e.target.value })} className="border border-gold/40 rounded px-3 py-2" />
          </div>
          <select value={form.vendor_id} onChange={(e) => setForm({ ...form, vendor_id: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2">
            <option value="">Link a vendor (optional)…</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border border-gold/40 rounded px-3 py-2" />
          <button className="bg-leaf text-white rounded px-4 py-2 text-sm">Save</button>
        </form>
      )}

      {loading ? (
        <p className="text-ink/50">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-ink/50">No budget items yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((i) => (
            <div key={i.id} className="temple-card p-3 mt-3 flex justify-between items-start">
              <div>
                <p className="font-medium">{i.item_name} <span className="text-xs text-ink/50">· {i.category}</span></p>
                <p className="text-xs text-ink/50 mt-1">
                  Est. {fmt(i.estimated_cost)}
                  {i.actual_cost != null && ` · Actual ${fmt(i.actual_cost)}`}
                  {i.paid_amount ? ` · Paid ${fmt(i.paid_amount)}` : ''}
                </p>
                {i.notes && <p className="text-xs text-ink/50 italic mt-1">{i.notes}</p>}
              </div>
              <button onClick={() => remove(i.id)} className="text-kumkum text-xs">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

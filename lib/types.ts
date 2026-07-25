export type TeamMember = {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
};

export type Vendor = {
  id: string;
  name: string;
  category: string;
  contact_person: string | null;
  phone: string | null;
  status: 'enquired' | 'shortlisted' | 'booked' | 'paid' | 'cancelled';
  cost_quoted: number | null;
  advance_paid: number | null;
  managed_by: string | null;
  notes: string | null;
};

export type BudgetItem = {
  id: string;
  category: string;
  item_name: string;
  estimated_cost: number;
  actual_cost: number | null;
  paid_amount: number | null;
  vendor_id: string | null;
  notes: string | null;
};

export type Task = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  due_date: string | null;
  status: 'pending' | 'in_progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  assigned_to: string | null;
  vendor_id: string | null;
};

export type WeddingEvent = {
  id: string;
  name: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  responsible: string | null;
  description: string | null;
};

export type Guest = {
  id: string;
  name: string;
  side: string | null;
  category: string | null;
  headcount: number;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  phone: string | null;
  invited_by: string | null;
  notes: string | null;
};

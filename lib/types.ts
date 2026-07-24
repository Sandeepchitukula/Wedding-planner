export interface BudgetItem {
  id: string;
  category: string;
  vendor: string;
  item: string;
  estimated_cost: number;
  actual_cost?: number;
  status: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  phone?: string;
  email?: string;
}

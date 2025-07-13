export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  photo?: string;
  address: {
    street: string;
    city?: string;
  };
  transactions: Transaction[];
  totalDue: number;
  lastTransactionDate: string;
  status: 'paid' | 'unpaid' | 'partial';
}

export interface Transaction {
  id: string;
  amount: number;
  billPhoto?: string;
  date: string;
  status: 'paid' | 'unpaid';
  paidDate?: string;
  description?: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: 'cash' | 'online' | 'bank_transfer' | 'cheque' | 'other';
  description?: string;
  receiptPhoto?: string;
}

export interface CustomerFormData {
  name: string;
  mobile: string;
  email?: string;
  photo?: string;
  street: string;
  city: string;
  billAmount: number;
  billPhoto?: string;
  transactionDate: string;
  description?: string;
}

// New interfaces for payables management
export interface Creditor {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  photo?: string;
  address: {
    street: string;
    city?: string;
  };
  payables: Payable[];
  totalOwed: number;
  lastPayableDate: string;
  status: 'paid' | 'unpaid' | 'partial';
  category: 'supplier' | 'lender' | 'service' | 'other';
}

export interface Payable {
  id: string;
  amount: number;
  billPhoto?: string;
  date: string;
  dueDate?: string;
  status: 'paid' | 'unpaid';
  paidDate?: string;
  description?: string;
  category: 'purchase' | 'loan' | 'service' | 'rent' | 'other';
  payments?: Payment[];
}

export interface CreditorFormData {
  name: string;
  mobile: string;
  email?: string;
  photo?: string;
  street: string;
  city: string;
  billAmount: number;
  billPhoto?: string;
  transactionDate: string;
  dueDate?: string;
  description?: string;
  category: 'supplier' | 'lender' | 'service' | 'other';
  payableCategory: 'purchase' | 'loan' | 'service' | 'rent' | 'other';
}

export interface User {
  id: string;
  email?: string;
  mobile?: string;
  name: string;
  authMethod: 'email' | 'mobile';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export interface UserProfile {
  name: string;
  businessName?: string;
  email?: string;
  mobile?: string;
  description?: string;
}

export interface FinancialSummary {
  totalReceivables: number;
  totalPayables: number;
  netPosition: number;
  overdueReceivables: number;
  overduePayables: number;
}
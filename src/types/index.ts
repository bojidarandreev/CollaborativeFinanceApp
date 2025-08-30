import { AuthCredentials } from '@supabase/supabase-js'

export type Signup = AuthCredentials

// Supabase's signInWithPassword takes the same credentials object
export type SigninWithPassword = AuthCredentials

export interface Account {
    id: string;
    user_id: string;
    name: string;
    institution?: string;
    currency: string;
    type?: string;
}

export interface Transaction {
    id: string;
    account_id: string;
    user_id: string;
    date: string; // timestamptz
    amount: number; // numeric(12,2)
    description: string;
    note?: string;
    receipt_url?: string;
}

export interface Category {
    id: string;
    user_id?: string; // Can be null for system-wide categories
    name: string;
    icon?: string;
    color?: string;
}

export interface Budget {
    id: string;
    scope: 'personal' | 'group';
    owner_id?: string;
    group_id?: string;
    category_id?: string;
    period_start: string; // date
    period_end: string; // date
    amount: number; // numeric(12,2)
    rollover: boolean;
}

export interface Group {
    id: string;
    name: string;
    owner_id: string;
}

export interface GroupMember {
    group_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member';
}

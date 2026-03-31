// Mock Data Store for PMCC CMS
// This replaces the PostgreSQL/Supabase database

export interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

export interface Member {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  join_date: string;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  status: string;
  created_at: string;
}

export interface Partnership {
  id: number;
  member_id: number;
  category: string;
  commitment_amount: number;
  frequency: string;
  status: string;
  created_at: string;
  member_name?: string;
}

export interface Testimony {
  id: number;
  full_name: string;
  email: string;
  title: string;
  content: string;
  media_urls?: string[];
  submitted_at: string;
  status: string;
}

export interface BaptismRequest {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  preferred_date: string;
  location: string;
  submitted_at: string;
  status: string;
}

export interface MediaAsset {
  id: number;
  title: string;
  file_url: string;
  file_type: string;
  category: string;
  uploaded_by: number;
  created_at: string;
}

export interface WebsiteSettings {
  id: number;
  hero_title: string;
  hero_subtitle: string;
  primary_action_text: string;
  secondary_action_text: string;
  notification_email: string;
  meta_title: string;
  google_analytics_id: string;
  forms_enabled: {
    partnership: boolean;
    testimony: boolean;
    baptism: boolean;
  };
  updated_at: string;
}

// Initial Data
export const users: User[] = [
  { id: 1, username: 'admin', role: 'Admin', created_at: new Date().toISOString() }
];

export const members: Member[] = [
  { id: 1, full_name: 'John Doe', email: 'john@example.com', phone: '1234567890', join_date: new Date().toISOString() },
  { id: 2, full_name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', join_date: new Date().toISOString() }
];

export const transactions: Transaction[] = [
  { id: 1, description: 'Sunday Tithe', amount: 500.00, type: 'Income', category: 'Tithe', date: '2026-03-22', status: 'Completed', created_at: new Date().toISOString() },
  { id: 2, description: 'Electricity Bill', amount: 150.00, type: 'Expense', category: 'Utilities', date: '2026-03-25', status: 'Completed', created_at: new Date().toISOString() }
];

export const partnerships: Partnership[] = [
  { id: 1, member_id: 1, category: 'Missions', commitment_amount: 100.00, frequency: 'Monthly', status: 'Active', created_at: new Date().toISOString() }
];

export const testimonies: Testimony[] = [
  { id: 1, full_name: 'Alice Brown', email: 'alice@example.com', title: 'Healed from Sickness', content: 'I was sick for three weeks but after prayer I was healed.', submitted_at: new Date().toISOString(), status: 'Approved', media_urls: [] }
];

export const baptismRequests: BaptismRequest[] = [
  { id: 1, full_name: 'Bob Wilson', email: 'bob@example.com', phone: '555-0101', preferred_date: '2026-04-12', location: 'Main Sanctuary', submitted_at: new Date().toISOString(), status: 'Pending' }
];

export const mediaAssets: MediaAsset[] = [
  { id: 1, title: 'Sunday Service Highlight', file_type: 'Video', category: 'Sermon', file_url: 'https://example.com/video1.mp4', uploaded_by: 1, created_at: new Date().toISOString() }
];

export let websiteSettings: WebsiteSettings = {
  id: 1,
  hero_title: 'Welcome to Prayer Miracle Church of Christ',
  hero_subtitle: 'Experience the power of prayer and the miracle of faith.',
  primary_action_text: 'Join Us Online',
  secondary_action_text: 'Request Prayer',
  notification_email: 'web-alerts@pmcc.org',
  meta_title: 'PMCC - Prayer Miracle Church of Christ',
  google_analytics_id: '',
  forms_enabled: {
    partnership: true,
    testimony: true,
    baptism: true
  },
  updated_at: new Date().toISOString()
};

// Helper functions for IDs
let nextIds = {
  users: 2,
  members: 3,
  transactions: 3,
  partnerships: 2,
  testimonies: 2,
  baptismRequests: 2,
  mediaAssets: 2
};

export const getNextId = (table: keyof typeof nextIds) => {
  return nextIds[table]++;
};

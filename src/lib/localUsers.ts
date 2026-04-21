import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'users.json');

// Default admin user
const DEFAULT_USERS = [
  {
    id: '1',
    username: 'admin',
    password: 'pmccsam1',
    role: 'Admin',
    permissions: {
      members: { view: true, edit: true },
      finance: { view: true, edit: true },
      testimonies: { view: true, edit: true },
      media: { view: true, edit: true },
      website: { view: true, edit: true },
      users: { view: true, edit: true }
    },
    created_at: new Date().toISOString()
  }
];

export interface LocalUser {
  id: string;
  username: string;
  password?: string;
  password_hash?: string; // Support for either
  role: string;
  permissions: any;
  created_at: string;
}

export function getLocalUsers(): LocalUser[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(DEFAULT_USERS, null, 2));
      return DEFAULT_USERS;
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local users file:', error);
    return DEFAULT_USERS;
  }
}

export function saveLocalUsers(users: LocalUser[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving local users file:', error);
  }
}

export function findLocalUserByUsername(username: string): LocalUser | undefined {
  const users = getLocalUsers();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

export function addLocalUser(user: Omit<LocalUser, 'id' | 'created_at'>): LocalUser {
  const users = getLocalUsers();
  const newUser = {
    ...user,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  saveLocalUsers(users);
  return newUser;
}

export function updateLocalUser(id: string, updates: Partial<LocalUser>): LocalUser | undefined {
  const users = getLocalUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return undefined;
  
  users[index] = { ...users[index], ...updates };
  saveLocalUsers(users);
  return users[index];
}

export function deleteLocalUser(id: string): boolean {
  let users = getLocalUsers();
  const initialLen = users.length;
  users = users.filter(u => u.id !== id);
  saveLocalUsers(users);
  return users.length < initialLen;
}

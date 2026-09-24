import { seedData } from './demoData';
export type { User } from './demoData';

const STORE_KEY = 'xcellearn_db';
const VERSION_KEY = 'xcellearn_db_version';
const DB_VERSION = 3;

export function getDb() {
  const version = localStorage.getItem(VERSION_KEY);
  if (version !== String(DB_VERSION)) {
    localStorage.setItem(STORE_KEY, JSON.stringify(seedData));
    localStorage.setItem(VERSION_KEY, String(DB_VERSION));
    return JSON.parse(JSON.stringify(seedData));
  }
  const data = localStorage.getItem(STORE_KEY);
  if (!data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(seedData));
    return JSON.parse(JSON.stringify(seedData));
  }
  return JSON.parse(data);
}

export function saveDb(data: any) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

export function resetDb() {
  localStorage.setItem(STORE_KEY, JSON.stringify(seedData));
  localStorage.setItem(VERSION_KEY, String(DB_VERSION));
}

import fs from 'fs';
import path from 'path';
import { getStore } from '@netlify/blobs';

export type Transaction = {
  id: string;
  created_at: string;
  buyer_name: string;
  tubes_count: number;
  price_per_tube: number;
  total_price: number;
  recipients_count: number;
  tubes_distribution: string;
  is_picked_up?: boolean;
};

export type StockHistory = {
  id: string;
  created_at: string;
  type: 'IN' | 'OUT';
  amount: number;
  before_stock: number;
  after_stock: number;
  description: string;
};

export type Settings = {
  selling_price: number;
  capital_price: number;
  max_capacity: number;
  current_stock: number;
  last_reset_time?: string;
};

export type DbSchema = {
  transactions: Transaction[];
  stockHistory: StockHistory[];
  settings: Settings;
};

const isProduction = process.env.NODE_ENV === 'production';
const DB_PATH = path.join(process.cwd(), 'local-db.json');

const defaultDb: DbSchema = {
  transactions: [],
  stockHistory: [],
  settings: {
    selling_price: 20000,
    capital_price: 18000,
    max_capacity: 200,
    current_stock: 0,
    last_reset_time: new Date(0).toISOString(),
  }
};

export async function getDb(): Promise<DbSchema> {
  if (isProduction) {
    try {
      const store = getStore('db');
      const data = await store.get('local-db', { type: 'json' });
      if (data) {
        return data as DbSchema;
      }
      return JSON.parse(JSON.stringify(defaultDb));
    } catch (error) {
      console.error('Netlify Blobs get error:', error);
      return JSON.parse(JSON.stringify(defaultDb));
    }
  } else {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2));
      return JSON.parse(JSON.stringify(defaultDb));
    }
    try {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return JSON.parse(JSON.stringify(defaultDb));
    }
  }
}

export async function saveDb(data: DbSchema) {
  if (isProduction) {
    try {
      const store = getStore('db');
      await store.setJSON('local-db', data);
    } catch (error) {
      console.error('Netlify Blobs set error:', error);
    }
  } else {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }
}

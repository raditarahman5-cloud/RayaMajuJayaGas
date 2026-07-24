import fs from 'fs';
import path from 'path';

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
};

export type DbSchema = {
  transactions: Transaction[];
  stockHistory: StockHistory[];
  settings: Settings;
};

const DB_PATH = path.join(process.cwd(), 'local-db.json');

const defaultDb: DbSchema = {
  transactions: [],
  stockHistory: [],
  settings: {
    selling_price: 20000,
    capital_price: 18000,
    max_capacity: 200,
    current_stock: 0,
  }
};

export function getDb(): DbSchema {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2));
    return defaultDb;
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return defaultDb;
  }
}

export function saveDb(data: DbSchema) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

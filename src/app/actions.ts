"use server";

import { revalidatePath } from "next/cache";
import { getDb, saveDb, Transaction, StockHistory } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export async function getSettings() {
  if (supabase) {
    // Implement Supabase logic here if keys exist
    // const { data } = await supabase.from('settings').select('*').single();
    // return data;
  }
  const db = await getDb();
  return db.settings;
}

export async function addStock(amount: number, description: string) {
  const db = await getDb();
  
  if (db.settings.current_stock + amount > db.settings.max_capacity) {
    return { success: false, error: `Kapasitas gudang tidak cukup. Maksimal kapasitas: ${db.settings.max_capacity} tabung.` };
  }

  const before_stock = db.settings.current_stock;
  db.settings.current_stock += amount;
  
  const history: StockHistory = {
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    type: 'IN',
    amount,
    before_stock,
    after_stock: db.settings.current_stock,
    description: description || "Penambahan stok dari agen"
  };

  db.stockHistory.push(history);
  await saveDb(db);
  
  revalidatePath("/", "layout");
  return { success: true };
}

export async function addTransaction(buyerName: string, tubesCount: number) {
  const db = await getDb();
  
  if (tubesCount < 1) return { success: false, error: "Jumlah tabung minimal 1." };
  if (tubesCount > db.settings.current_stock) return { success: false, error: "Stok tidak mencukupi." };
  if (db.settings.current_stock === 0) return { success: false, error: "Stok sedang kosong." };

  const distributionText = `${tubesCount} tabung`;
  const totalRecipients = 1;

  const before_stock = db.settings.current_stock;
  db.settings.current_stock -= tubesCount;

  const transaction: Transaction = {
    id: `TRX-${Date.now()}`,
    created_at: new Date().toISOString(),
    buyer_name: buyerName,
    tubes_count: tubesCount,
    price_per_tube: db.settings.selling_price,
    total_price: tubesCount * db.settings.selling_price,
    recipients_count: totalRecipients,
    tubes_distribution: distributionText,
    is_picked_up: false
  };

  const history: StockHistory = {
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    type: 'OUT',
    amount: tubesCount,
    before_stock,
    after_stock: db.settings.current_stock,
    description: `Penjualan ke ${buyerName} (${tubesCount} tabung)`
  };

  db.transactions.push(transaction);
  db.stockHistory.push(history);
  await saveDb(db);

  revalidatePath("/", "layout");
  return { success: true };
}

export async function getDashboardData() {
  const db = await getDb();
  
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.substring(0, 7);

  const lastResetTime = db.settings.last_reset_time ? new Date(db.settings.last_reset_time).getTime() : 0;

  const todayTransactions = db.transactions.filter(t => {
    const isToday = t.created_at.startsWith(today);
    const isAfterReset = new Date(t.created_at).getTime() >= lastResetTime;
    return isToday && isAfterReset;
  });
  
  const monthTransactions = db.transactions.filter(t => t.created_at.startsWith(thisMonth));

  const soldToday = todayTransactions.reduce((acc, curr) => acc + curr.tubes_count, 0);
  const incomeToday = todayTransactions.reduce((acc, curr) => acc + (curr.tubes_count * db.settings.selling_price), 0);
  
  const incomeMonth = monthTransactions.reduce((acc, curr) => acc + (curr.tubes_count * db.settings.selling_price), 0);
  
  const profitToday = todayTransactions.reduce((acc, curr) => {
    return acc + (curr.tubes_count * (db.settings.selling_price - db.settings.capital_price));
  }, 0);
  
  const profitMonth = monthTransactions.reduce((acc, curr) => {
    return acc + (curr.tubes_count * (db.settings.selling_price - db.settings.capital_price));
  }, 0);

  // Data untuk chart 7 hari terakhir
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayTx = db.transactions.filter(t => t.created_at.startsWith(dateStr));
    
    chartData.push({
      name: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      penjualan: dayTx.reduce((acc, curr) => acc + curr.tubes_count, 0),
      pendapatan: dayTx.reduce((acc, curr) => acc + (curr.tubes_count * db.settings.selling_price), 0),
    });
  }

  return {
    settings: db.settings,
    soldToday,
    txCountToday: todayTransactions.length,
    incomeToday,
    incomeMonth,
    profitToday,
    profitMonth,
    chartData
  };
}

export async function updateSettings(sellingPrice: number, capitalPrice: number, maxCapacity: number) {
  const db = await getDb();
  db.settings.selling_price = sellingPrice;
  db.settings.capital_price = capitalPrice;
  db.settings.max_capacity = maxCapacity;
  await saveDb(db);
  
  revalidatePath("/", "layout");
  return { success: true };
}

export async function resetDailyStats() {
  const db = await getDb();
  db.settings.current_stock = 0;
  db.settings.last_reset_time = new Date().toISOString();
  await saveDb(db);
  
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getTransactions() {
  const db = await getDb();
  // Return transactions sorted by: newest date first, but oldest time first within the same date
  return db.transactions.sort((a, b) => {
    const dateA = a.created_at.split('T')[0];
    const dateB = b.created_at.split('T')[0];
    if (dateA === dateB) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); // Oldest first within the same day
    }
    return new Date(dateB).getTime() - new Date(dateA).getTime(); // Newest day first
  });
}

export async function getStockHistory() {
  const db = await getDb();
  return db.stockHistory.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateTransactionStatus(id: string, is_picked_up: boolean) {
  const db = await getDb();
  const txIndex = db.transactions.findIndex(t => t.id === id);
  if (txIndex !== -1) {
    db.transactions[txIndex].is_picked_up = is_picked_up;
    await saveDb(db);
    revalidatePath("/", "layout");
    return { success: true };
  }
  return { success: false, error: "Transaction not found" };
}

import { getTransactions, getSettings } from "@/app/actions";
import { LaporanClient } from "./laporan-client";

export default async function LaporanPage() {
  const transactions = await getTransactions();
  const settings = await getSettings();
  
  return <LaporanClient transactions={transactions} settings={settings} />;
}

export const dynamic = 'force-dynamic';

import { getSettings } from "@/app/actions";
import { PenjualanClient } from "./penjualan-client";

export default async function PenjualanPage() {
  const settings = await getSettings();
  
  return <PenjualanClient settings={settings} />;
}

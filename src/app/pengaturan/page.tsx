export const dynamic = 'force-dynamic';

import { getSettings } from "@/app/actions";
import { PengaturanClient } from "./pengaturan-client";

export default async function PengaturanPage() {
  const settings = await getSettings();
  
  return <PengaturanClient settings={settings} />;
}

import { getSettings, getStockHistory } from "@/app/actions";
import { StockClient } from "./stock-client";

export default async function StokPage() {
  const settings = await getSettings();
  const history = await getStockHistory();
  
  return <StockClient settings={settings} history={history} />;
}

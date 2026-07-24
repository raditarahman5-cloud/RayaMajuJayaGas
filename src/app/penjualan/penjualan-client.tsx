"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addTransaction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Users, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export function PenjualanClient({ settings }: { settings: any }) {
  const [buyerName, setBuyerName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const tubesCount = Number(amount);

    if (!buyerName || !amount || isNaN(tubesCount) || tubesCount <= 0) {
      toast({ title: "Error", description: "Mohon isi formulir dengan benar.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const res = await addTransaction(buyerName, tubesCount);
    setLoading(false);

    if (res.success) {
      toast({ title: "Berhasil", description: "Transaksi berhasil disimpan." });
      setBuyerName("");
      setAmount("");
      router.push("/laporan");
    } else {
      toast({ title: "Gagal", description: res.error, variant: "destructive" });
    }
  };

  const amountNum = Number(amount) || 0;
  const fullRecipients = Math.floor(amountNum / 2);
  const remainder = amountNum % 2;
  const totalRecipients = fullRecipients + (remainder > 0 ? 1 : 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Penjualan</h2>
        <p className="text-slate-500 dark:text-slate-400">Catat transaksi penjualan tabung LPG baru.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              Form Transaksi
            </CardTitle>
            <CardDescription>Masukkan rincian penjualan.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleTransaction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buyer">Nama Pembeli / Perwakilan</Label>
                <Input 
                  id="buyer" 
                  placeholder="Contoh: Budi Santoso" 
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah Tabung</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  min="1" 
                  max={settings.current_stock}
                  placeholder="Contoh: 10" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-500">Maksimal stok saat ini: {settings.current_stock} tabung</p>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6" disabled={loading || settings.current_stock === 0}>
                {loading ? "Menyimpan..." : "Proses Pembayaran"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm border-orange-100 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <CreditCard className="h-5 w-5" />
                Total Tagihan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-500">
                Rp {(amountNum * settings.selling_price).toLocaleString('id-ID')}
              </div>
              <p className="text-sm text-slate-500 mt-2">Harga per tabung: Rp {settings.selling_price.toLocaleString('id-ID')}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-500" />
                Estimasi Distribusi
              </CardTitle>
              <CardDescription>Sesuai aturan maksimal 2 tabung per orang.</CardDescription>
            </CardHeader>
            <CardContent>
              {amountNum > 0 ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Total Penerima:</span>
                    <span className="font-semibold">{totalRecipients} Orang</span>
                  </div>
                  <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                    {fullRecipients > 0 && <li>{fullRecipients} orang memperoleh 2 tabung</li>}
                    {remainder > 0 && <li>1 orang memperoleh 1 tabung</li>}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Masukkan jumlah tabung untuk melihat estimasi distribusi.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

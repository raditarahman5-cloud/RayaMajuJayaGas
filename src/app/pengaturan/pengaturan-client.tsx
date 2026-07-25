"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateSettings, resetDailyStats } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, RotateCcw } from "lucide-react";

export function PengaturanClient({ settings }: { settings: any }) {
  const [sellingPrice, setSellingPrice] = useState(settings.selling_price.toString());
  const [capitalPrice, setCapitalPrice] = useState(settings.capital_price.toString());
  const [maxCapacity, setMaxCapacity] = useState(settings.max_capacity.toString());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await updateSettings(Number(sellingPrice), Number(capitalPrice), Number(maxCapacity));
      
      if (res.success) {
        toast({ title: "Berhasil", description: "Pengaturan telah diperbarui." });
      } else {
        toast({ title: "Gagal", description: "Terjadi kesalahan saat menyimpan.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Gagal", description: error?.message || "Terjadi kesalahan sistem", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Apakah Anda yakin ingin mereset stok ke 0 dan mereset antrian hari ini? Riwayat transaksi akan tetap tersimpan.")) return;
    
    try {
      setLoading(true);
      const res = await resetDailyStats();
      if (res.success) {
        toast({ title: "Berhasil", description: "Data hari ini telah di-reset." });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast({ title: "Gagal", description: "Terjadi kesalahan.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Gagal", description: error?.message || "Terjadi kesalahan sistem", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Pengaturan</h2>
        <p className="text-slate-500 dark:text-slate-400">Konfigurasi harga dan kapasitas operasional pangkalan.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-500" />
              Konfigurasi Sistem
            </CardTitle>
            <CardDescription>Perubahan harga hanya akan berlaku untuk transaksi baru.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Harga Jual (Rp)</Label>
                <Input 
                  id="sellingPrice" 
                  type="number" 
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-500">Harga yang diberikan kepada pembeli.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capitalPrice">Harga Modal (Rp)</Label>
                <Input 
                  id="capitalPrice" 
                  type="number" 
                  value={capitalPrice}
                  onChange={(e) => setCapitalPrice(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-500">Digunakan untuk menghitung laba bersih.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxCapacity">Kapasitas Gudang Maksimal (Tabung)</Label>
                <Input 
                  id="maxCapacity" 
                  type="number" 
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-500">Batas maksimal stok tabung yang dapat disimpan.</p>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-slate-50 dark:bg-slate-900/50 py-4">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto gap-2">
                <Save className="h-4 w-4" />
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="shadow-sm border-red-100 dark:border-red-900/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
              <RotateCcw className="h-5 w-5" />
              Reset Data Hari Ini
            </CardTitle>
            <CardDescription>
              Tombol ini akan mereset Stok Saat Ini menjadi 0, dan memulai sesi baru untuk hari ini. 
              Riwayat penjualan sebelumnya dan laporan minggu ini akan tetap aman dan tidak terhapus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleReset} 
              disabled={loading}
              className="w-full sm:w-auto gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Dari 0 Semua
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addStock } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { PackagePlus, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function StockClient({ settings, history }: { settings: any, history: any[] }) {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({ title: "Error", description: "Jumlah tabung tidak valid", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const res = await addStock(Number(amount), desc);
      
      if (res.success) {
        toast({ title: "Berhasil", description: "Stok berhasil ditambahkan" });
        setAmount("");
        setDesc("");
      } else {
        toast({ title: "Gagal", description: res.error, variant: "destructive" });
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
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Kelola Stok</h2>
        <p className="text-slate-500 dark:text-slate-400">Tambahkan stok tabung LPG dari agen dan pantau riwayat perubahannya.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-orange-50/50 dark:bg-orange-950/20 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <PackagePlus className="h-5 w-5 text-orange-500" />
                Stok Masuk
              </CardTitle>
              <CardDescription>Tambahkan stok ke gudang.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddStock} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Jumlah Tabung</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    min="1" 
                    placeholder="Contoh: 50" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Keterangan (Opsional)</Label>
                  <Input 
                    id="desc" 
                    type="text" 
                    placeholder="Contoh: Stok dari agen XYZ" 
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </div>
                <div className="pt-2 text-sm text-slate-500">
                  <p>Kapasitas tersisa: <span className="font-medium text-slate-900 dark:text-white">{settings.max_capacity - settings.current_stock} tabung</span></p>
                </div>
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Stok Masuk"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="shadow-sm h-full">
            <CardHeader>
              <CardTitle>Riwayat Stok</CardTitle>
              <CardDescription>Catatan penambahan dan pengurangan stok.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow>
                      <TableHead className="whitespace-nowrap text-xs sm:text-sm">Waktu</TableHead>
                      <TableHead className="text-xs sm:text-sm">Tipe</TableHead>
                      <TableHead className="text-center text-xs sm:text-sm">Jumlah</TableHead>
                      <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Sisa Stok</TableHead>
                      <TableHead className="hidden md:table-cell text-xs sm:text-sm">Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">Belum ada riwayat stok</TableCell>
                      </TableRow>
                    ) : (
                      history.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                            {format(new Date(h.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {h.type === 'IN' ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-[10px] sm:text-xs"><ArrowDownRight className="mr-1 h-3 w-3" /> Masuk</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 text-[10px] sm:text-xs"><ArrowUpRight className="mr-1 h-3 w-3" /> Keluar</Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-center text-xs sm:text-sm">
                            {h.type === 'IN' ? '+' : '-'}{h.amount}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{h.after_stock}</TableCell>
                          <TableCell className="hidden md:table-cell text-slate-500 max-w-[200px] truncate text-xs sm:text-sm" title={h.description}>
                            {h.description}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

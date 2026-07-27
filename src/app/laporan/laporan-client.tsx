"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Search, Check, X } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { Transaction } from "@/lib/store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { updateTransactionStatus } from "@/app/actions";

export function LaporanClient({ transactions, settings }: { transactions: Transaction[], settings: any }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(transactions);

  useEffect(() => {
    setLocalTransactions(transactions);
  }, [transactions]);

  const lastResetTime = settings.last_reset_time ? new Date(settings.last_reset_time).getTime() : 0;

  const filtered = localTransactions.filter(t => {
    const matchesSearch = t.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'today') {
      const isAfterReset = new Date(t.created_at).getTime() >= lastResetTime;
      return matchesSearch && isAfterReset;
    }
    return matchesSearch;
  });

  const exportToExcel = () => {
    const dataToExport = filtered.map(t => ({
      "ID Transaksi": t.id,
      "Tanggal": format(new Date(t.created_at), 'dd MMM yyyy HH:mm', { locale: id }),
      "Pembeli": t.buyer_name,
      "Tabung": t.tubes_count,
      "Harga Satuan": settings.selling_price,
      "Total": t.tubes_count * settings.selling_price,
      "Distribusi": t.tubes_distribution
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan");
    XLSX.writeFile(workbook, `Laporan_Penjualan_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Laporan Penjualan - Raya Maju Jaya", 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}`, 14, 28);
    
    const tableColumn = ["ID", "Tanggal", "Pembeli", "Tabung", "Total Harga"];
    const tableRows = filtered.map(t => [
      t.id,
      format(new Date(t.created_at), 'dd/MM/yyyy HH:mm'),
      t.buyer_name,
      t.tubes_count.toString(),
      `Rp ${(t.tubes_count * settings.selling_price).toLocaleString('id-ID')}`
    ]);

    autoTable(doc, {
      startY: 35,
      head: [tableColumn],
      body: tableRows,
    });
    
    doc.save(`Laporan_Penjualan_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Laporan Penjualan</h2>
          <p className="text-slate-500 dark:text-slate-400">Data seluruh transaksi penjualan tabung LPG.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportToPDF}>
            <Download className="h-4 w-4" /> Export PDF
          </Button>
          <Button variant="outline" className="gap-2" onClick={exportToExcel}>
            <Download className="h-4 w-4" /> Export Excel
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex items-center gap-2 max-w-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Cari nama pembeli atau ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('today')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'today' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Sesi Saat Ini
              </button>
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Riwayat Semua
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-b-md overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="hidden md:table-cell whitespace-nowrap">ID Trx</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm">Tanggal</TableHead>
                  <TableHead className="whitespace-nowrap text-xs sm:text-sm">Pembeli</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">Tabung</TableHead>
                  <TableHead className="hidden sm:table-cell text-right text-xs sm:text-sm">Harga</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Total</TableHead>
                  <TableHead className="hidden lg:table-cell whitespace-nowrap text-xs sm:text-sm">Distribusi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-12">Tidak ada data transaksi ditemukan</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="hidden md:table-cell font-medium text-xs text-slate-500">{t.id}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                        {format(new Date(t.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span>{t.buyer_name}</span>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant={t.is_picked_up ? "default" : "outline"} 
                              size="icon" 
                              className={`h-6 w-6 ${t.is_picked_up ? "bg-green-500 hover:bg-green-600 text-white" : ""}`}
                              onClick={async () => {
                                setLocalTransactions(prev => prev.map(item => item.id === t.id ? { ...item, is_picked_up: true } : item));
                                try {
                                  await updateTransactionStatus(t.id, true);
                                } catch (error) {
                                  setLocalTransactions(transactions);
                                }
                              }}
                              title="Sudah Diambil"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant={t.is_picked_up === false ? "destructive" : "outline"} 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={async () => {
                                setLocalTransactions(prev => prev.map(item => item.id === t.id ? { ...item, is_picked_up: false } : item));
                                try {
                                  await updateTransactionStatus(t.id, false);
                                } catch (error) {
                                  setLocalTransactions(transactions);
                                }
                              }}
                              title="Belum Diambil"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-orange-600 dark:text-orange-400 text-xs sm:text-sm">{t.tubes_count}</TableCell>
                      <TableCell className="hidden sm:table-cell text-right text-xs sm:text-sm">Rp {(settings.selling_price / 1000).toFixed(0)}k</TableCell>
                      <TableCell className="text-right font-medium text-xs sm:text-sm">Rp {(t.tubes_count * settings.selling_price).toLocaleString('id-ID')}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-slate-500 min-w-[200px]">
                        {t.tubes_distribution}
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
  );
}

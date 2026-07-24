"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, TrendingUp, DollarSign, Wallet, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Progress } from "@/components/ui/progress";

export function DashboardClient({ data }: { data: any }) {
  const { 
    settings, soldToday, txCountToday, incomeToday, 
    incomeMonth, profitToday, profitMonth, chartData 
  } = data;

  const capacityPercentage = Math.round((settings.current_stock / settings.max_capacity) * 100);
  const isLowStock = settings.current_stock <= 20;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
        <p className="text-slate-500 dark:text-slate-400">Ringkasan kondisi usaha hari ini.</p>
      </div>

      {isLowStock && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20 flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-400">Peringatan Stok Rendah</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">Stok tabung LPG saat ini tersisa {settings.current_stock}. Segera lakukan pemesanan ke agen.</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Tersedia</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.current_stock} <span className="text-sm font-normal text-slate-500">/ {settings.max_capacity}</span></div>
            <Progress value={capacityPercentage} className="mt-3 h-2" />
            <p className="text-xs text-slate-500 mt-2">{capacityPercentage}% dari kapasitas gudang</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tabung Terjual (Hari Ini)</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soldToday}</div>
            <p className="text-xs text-slate-500 mt-1">Dari {txCountToday} transaksi</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan (Hari Ini)</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {incomeToday.toLocaleString('id-ID')}</div>
            <p className="text-xs text-slate-500 mt-1">Bulan ini: Rp {incomeMonth.toLocaleString('id-ID')}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laba Bersih (Hari Ini)</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {profitToday.toLocaleString('id-ID')}</div>
            <p className="text-xs text-slate-500 mt-1">Bulan ini: Rp {profitMonth.toLocaleString('id-ID')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Grafik Penjualan 7 Hari Terakhir</CardTitle>
            <CardDescription>Jumlah tabung yang terjual.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="penjualan" fill="#f97316" radius={[4, 4, 0, 0]} name="Tabung Terjual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Grafik Pendapatan</CardTitle>
            <CardDescription>Total pendapatan (Rupiah).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: any) => `Rp ${value / 1000}k`} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                  <Line type="monotone" dataKey="pendapatan" stroke="#10b981" strokeWidth={3} dot={{r: 4}} name="Pendapatan" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

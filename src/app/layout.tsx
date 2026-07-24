import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pangkalan LPG - Raya Maju Jaya",
  description: "Aplikasi Manajemen Penjualan dan Stok LPG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64 mt-16 lg:mt-0 transition-all duration-300">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

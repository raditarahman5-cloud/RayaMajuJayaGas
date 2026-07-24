"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  Settings, 
  LogOut,
  Flame,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Stok Masuk", icon: Package, path: "/stok" },
  { name: "Penjualan", icon: ShoppingCart, path: "/penjualan" },
  { name: "Laporan", icon: FileText, path: "/laporan" },
  { name: "Pengaturan", icon: Settings, path: "/pengaturan" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on path change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 z-30 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white shadow-md shadow-orange-500/20">
            <Flame className="h-5 w-5" />
          </div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">Raya Maju Jaya</h1>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-md"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 border-r bg-white px-3 py-4 transition-transform lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900 flex flex-col shadow-sm",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="mb-8 flex items-center gap-3 px-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white shadow-md shadow-orange-500/20">
          <Flame className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">Raya Maju Jaya</h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Kutaringin Darit</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== "/");
          return (
            <Link
              key={item.name}
              href={item.path}
              className={cn(
                "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  isActive ? "text-orange-600 dark:text-orange-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
        <button className="group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all dark:text-red-400 dark:hover:bg-red-500/10">
          <LogOut className="mr-3 h-5 w-5 text-red-500 transition-colors group-hover:text-red-600 dark:group-hover:text-red-400" />
          Keluar
        </button>
      </div>
    </aside>
    </>
  );
}

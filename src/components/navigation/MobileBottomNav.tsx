"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, User, Plus } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Keşfet", href: "/", icon: Home },
    { label: "Favoriler", href: "/favoriler", icon: Heart },
    { label: "Paylaş", href: "/firsat/yeni", icon: Plus, isAction: true },
    { label: "Profilim", href: "/profil", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-md px-3 py-1.5 sm:hidden shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5 group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-md transition group-active:scale-90">
                  <Plus className="h-6 w-6 stroke-[2.5]" />
                </div>
                <span className="mt-1 text-[10px] font-bold text-slate-800">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition ${
                isActive ? "text-slate-950 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

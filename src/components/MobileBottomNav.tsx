"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, User, PlusCircle } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Keşfet", icon: Home },
    { href: "/favoriler", label: "Favoriler", icon: Heart },
    { href: "/firsat/yeni", label: "Paylaş", icon: PlusCircle, highlight: true },
    { href: "/profil", label: "Profilim", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur-md px-3 py-1.5 sm:hidden shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center text-teal-700 active:scale-95 transition"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-white shadow-md">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="mt-0.5 text-[10px] font-bold text-teal-900">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                active
                  ? "text-teal-800 font-bold"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  active ? "text-teal-700 stroke-[2.5]" : "text-stone-400 stroke-2"
                }`}
              />
              <span className="mt-0.5 text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

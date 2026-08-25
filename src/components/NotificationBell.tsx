"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import type { NotificationItem } from "@/server/notifications";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function fetchNotifications() {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setItems(data.items);
          setUnreadCount(data.unreadCount);
        }
      })
      .catch(() => null);
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkAllRead() {
    await fetch("/api/notifications", { method: "POST" });
    setUnreadCount(0);
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Bildirimler"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 active:scale-95 shadow-2xs"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
            <span className="text-sm font-bold text-slate-900">Bildirimler</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-amber-800 transition cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5 text-amber-600" />
                Tümünü Okundu Say
              </button>
            )}
          </div>

          <div className="mt-2 max-h-72 divide-y divide-slate-100 overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Henüz yeni bildiriminiz bulunmuyor.
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 transition rounded-xl ${
                    n.isRead ? "bg-white" : "bg-amber-50/50"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{n.title}</p>
                  <p className="mt-0.5 text-xs text-slate-600 leading-snug">{n.message}</p>
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => setOpen(false)}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:underline"
                    >
                      <span>İncele</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

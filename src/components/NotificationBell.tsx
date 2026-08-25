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
    const interval = setInterval(fetchNotifications, 60000); // 1 dk polling
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
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition hover:border-stone-300 hover:bg-stone-50 active:scale-95 shadow-2xs"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-stone-200 bg-white p-3 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2 px-1">
            <span className="text-sm font-bold text-stone-900">Bildirimler</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tümünü Okundu Say
              </button>
            )}
          </div>

          <div className="mt-2 max-h-72 divide-y divide-stone-100 overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400">
                Henüz yeni bildiriminiz yok.
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={`p-2.5 transition rounded-xl ${
                    n.isRead ? "bg-white" : "bg-teal-50/40"
                  }`}
                >
                  <p className="text-xs font-semibold text-stone-900">{n.title}</p>
                  <p className="mt-0.5 text-xs text-stone-600 leading-snug">{n.message}</p>
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => setOpen(false)}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:underline"
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

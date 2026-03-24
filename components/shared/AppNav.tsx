"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/map",     icon: "explore",        label: "Discovery"     },
  { href: "/chat",    icon: "chat_bubble",    label: "Conversations" },
  { href: "/groups",  icon: "group",          label: "Communities"   },
  { href: "/radio",   icon: "radio",          label: "Radio"         },
  { href: "/profile", icon: "person",         label: "Settings"      },
];

const MOBILE_NAV = [
  { href: "/map",     icon: "map",            label: "Map"     },
  { href: "/chat",    icon: "forum",          label: "Chats"   },
  { href: "/groups",  icon: "groups",         label: "Groups"  },
  { href: "/radio",   icon: "radio",          label: "Radio"   },
  { href: "/profile", icon: "account_circle", label: "Profile" },
];

export default function AppNav({ userId }: { userId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMap = pathname.startsWith("/map");
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;
      const data = await res.json();
      const total = Array.isArray(data) ? data.reduce((sum: number, c: any) => sum + (c.unread_count ?? 0), 0) : 0;
      setTotalUnread(total);
    }
    fetchUnread();
    // Refresh unread count when navigating away from chat
    const supabase = createClient();
    const channel = supabase
      .channel("nav-unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, fetchUnread)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Material Symbols font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

      {/* ── Top Header ── */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-6 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/map" className="text-2xl font-black text-indigo-600 italic" style={{ fontFamily: "var(--font-headline)" }}>
              Bamble
            </Link>
            {/* Desktop inline nav (only on map page where sidebar is hidden) */}
            {isMap && (
              <nav className="hidden md:flex items-center gap-2">
                {[{ href: "/map", label: "Discovery" }, { href: "/chat", label: "Conversations" }, { href: "/groups", label: "Communities" }, { href: "/radio", label: "Radio" }].map(({ href, label }) => (
                  <Link key={href} href={href}
                    className={cn("px-4 py-1 rounded-lg text-sm font-semibold transition-colors", pathname.startsWith(href) ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:bg-slate-100")}
                    style={{ fontFamily: "var(--font-body)" }}>
                    {label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
              <span className="material-symbols-outlined text-slate-500 text-xl">notifications</span>
            </button>
            <button onClick={handleSignOut} className="p-2 rounded-full hover:bg-slate-100 transition-colors" title="Sign out">
              <span className="material-symbols-outlined text-slate-500 text-xl">logout</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm ml-1">
              <span className="material-symbols-outlined text-indigo-600 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Desktop Sidebar (hidden on map) ── */}
      {!isMap && (
        <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-40 bg-slate-50 p-4 pt-20 space-y-1">
          {/* Anonymous user card */}
          <div className="mb-6 px-3">
            <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-indigo-600" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
            <p className="text-sm font-bold text-[#2c3437]" style={{ fontFamily: "var(--font-headline)" }}>Anonymous Explorer</p>
            <p className="text-xs text-[#596064]">Privacy Mode Active</p>
          </div>

          <nav className="space-y-0.5 flex-1">
            {NAV_ITEMS.map(({ href, icon, label }) => {
              const active = pathname.startsWith(href);
              const isChat = href === "/chat";
              const badge = isChat && totalUnread > 0 ? (totalUnread > 99 ? "99+" : String(totalUnread)) : null;
              return (
                <Link key={href} href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                    active
                      ? "bg-indigo-50 text-indigo-700 translate-x-0.5"
                      : "text-slate-600 hover:bg-slate-200"
                  )}
                  style={{ fontFamily: "var(--font-headline)" }}>
                  <span className="relative">
                    <span className="material-symbols-outlined text-xl" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
                    {badge && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{badge}</span>
                    )}
                  </span>
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto p-2">
            <Link href="/map"
              className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-colors active:scale-95"
              style={{ fontFamily: "var(--font-headline)" }}>
              <span className="material-symbols-outlined text-base">add_location_alt</span>
              Drop a Pin
            </Link>
          </div>
        </aside>
      )}

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-6 pb-8 pt-3 bg-white/90 backdrop-blur-2xl rounded-t-[32px] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] z-50">
        {MOBILE_NAV.map(({ href, icon, label }) => {
          const active = pathname.startsWith(href);
          const isChat = href === "/chat";
          const badge = isChat && totalUnread > 0 ? (totalUnread > 99 ? "99+" : String(totalUnread)) : null;
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5">
              <span className="relative">
                <span className={cn("material-symbols-outlined text-2xl", active ? "text-indigo-600" : "text-slate-400")}
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
                {badge && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{badge}</span>
                )}
              </span>
              <span className={cn("text-[10px] font-bold uppercase tracking-wide", active ? "text-indigo-600" : "text-slate-400")}
                style={{ fontFamily: "var(--font-body)" }}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

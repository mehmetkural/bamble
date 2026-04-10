"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/map",     icon: "map",            label: "Map"         },
  { href: "/chat",    icon: "chat_bubble",    label: "Chats"       },
  { href: "/groups",  icon: "diversity_3",    label: "Communities" },
  { href: "/radio",   icon: "radio",          label: "Radio"       },
  { href: "/profile", icon: "account_circle", label: "Profile"     },
];

export default function AppNav({ userId }: { userId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;
      const data = await res.json();
      const total = Array.isArray(data)
        ? data.reduce((sum: number, c: any) => sum + (c.unread_count ?? 0), 0)
        : 0;
      setTotalUnread(total);
    }
    fetchUnread();
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
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-20 lg:w-64 flex-col py-8 px-3 lg:px-4 z-40 bg-slate-50/90 backdrop-blur-2xl transition-all duration-300 border-r border-slate-200/40">
        {/* Logo */}
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-[#00464d] flex items-center justify-center shadow-md shrink-0">
            <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-black text-cyan-900 font-headline leading-none">Bamble</h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Find your people</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1.5">
          {NAV_ITEMS.map(({ href, icon, label }) => {
            const active = pathname.startsWith(href);
            const isChat = href === "/chat";
            const badge = isChat && totalUnread > 0 ? (totalUnread > 99 ? "99+" : String(totalUnread)) : null;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center justify-center lg:justify-start gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                  active
                    ? "bg-cyan-100/60 text-cyan-900"
                    : "text-slate-500 hover:bg-cyan-50 hover:text-cyan-800"
                )}
              >
                <span
                  className="material-symbols-outlined text-xl shrink-0"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {icon}
                </span>
                <span className={cn("hidden lg:block text-sm font-semibold", active ? "font-bold" : "")}>
                  {label}
                </span>
                {badge && (
                  <span className="absolute top-2 left-7 lg:static lg:ml-auto min-w-[18px] h-[18px] px-1 bg-[#00464d] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto pt-6 border-t border-slate-200/50 space-y-2">
          <Link
            href="/map"
            className="w-full flex items-center justify-center lg:justify-start gap-3 py-3 px-3 bg-[#00464d] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#006069] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-xl">add_location_alt</span>
            <span className="hidden lg:block">Drop a Pin</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center lg:justify-start gap-3 py-2.5 px-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all text-sm"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="hidden lg:block font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 w-[96%] max-w-lg bg-white/85 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex justify-around items-center px-2 py-2.5 z-50">
        {NAV_ITEMS.map(({ href, icon, label }) => {
          const active = pathname.startsWith(href);
          const isChat = href === "/chat";
          const badge = isChat && totalUnread > 0 ? (totalUnread > 99 ? "99+" : String(totalUnread)) : null;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-2xl transition-all active:scale-90",
                active ? "bg-cyan-900 text-white" : "text-slate-500"
              )}
            >
              <span className="relative">
                <span
                  className="material-symbols-outlined text-xl"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {icon}
                </span>
                {badge && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 bg-[#00464d] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wide mt-0.5">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

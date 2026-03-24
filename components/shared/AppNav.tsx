"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/map",     icon: "map",           label: "Map"      },
  { href: "/chat",    icon: "forum",         label: "Chat"     },
  { href: "/groups",  icon: "groups",        label: "Groups"   },
  { href: "/profile", icon: "account_circle", label: "Profile" },
];

export default function AppNav({ userId }: { userId: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-6 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/map" className="text-2xl font-black text-indigo-600 italic" style={{ fontFamily: "var(--font-headline)" }}>
              Bamble
            </Link>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-2">
              {NAV_ITEMS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors",
                    pathname.startsWith(href)
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-slate-500 hover:bg-slate-100"
                  )}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full text-sm text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Sign out</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm">
              <span className="material-symbols-outlined text-indigo-600 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Google Material Symbols font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-6 pb-8 pt-4 bg-white/90 backdrop-blur-2xl rounded-t-[32px] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] z-50">
        {NAV_ITEMS.map(({ href, icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="flex flex-col items-center justify-center gap-0.5">
              <span
                className={cn("material-symbols-outlined text-2xl", active ? "text-indigo-600" : "text-slate-400")}
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {icon}
              </span>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", active ? "text-indigo-600" : "text-slate-400")} style={{ fontFamily: "var(--font-body)" }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

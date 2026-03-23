"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Map, MessageCircle, Users, User, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/map",     icon: Map,           label: "Map"      },
  { href: "/chat",    icon: MessageCircle, label: "Chat"     },
  { href: "/groups",  icon: Users,         label: "Groups"   },
  { href: "/profile", icon: User,          label: "Profile"  },
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
    <nav className="bg-white border-b border-gray-200 px-4 flex items-center justify-between h-14 shrink-0">
      <Link href="/map" className="font-bold text-xl text-indigo-600">
        Bamble
      </Link>

      <div className="flex items-center gap-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors ml-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </nav>
  );
}

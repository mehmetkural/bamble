"use client";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMap = pathname.startsWith("/map");
  return (
    <main className={cn(
      "h-full overflow-hidden pb-[80px] md:pb-0",
      "md:ml-20 lg:ml-64"
    )}>
      {children}
    </main>
  );
}

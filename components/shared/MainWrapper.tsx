"use client";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMap = pathname.startsWith("/map");
  return (
    <main className={cn(
      "flex-1 overflow-hidden pt-[56px] pb-[88px] md:pb-0",
      !isMap && "md:ml-64"
    )}>
      {children}
    </main>
  );
}

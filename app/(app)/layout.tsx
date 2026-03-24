import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppNav from "@/components/shared/AppNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="h-full flex flex-col">
      <AppNav userId={user.id} />
      <main className="flex-1 overflow-hidden pt-[56px] pb-[88px] md:pb-0">{children}</main>
    </div>
  );
}

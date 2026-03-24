import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppNav from "@/components/shared/AppNav";
import MainWrapper from "@/components/shared/MainWrapper";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="h-full flex flex-col">
      <AppNav userId={user.id} />
      <MainWrapper>{children}</MainWrapper>
    </div>
  );
}

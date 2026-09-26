import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePlus2, History, Settings, Users, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
  });
}

export function AppShell({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  const { data: isAdmin } = useIsAdmin();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const nav = [
    { to: "/new", label: "New", icon: FilePlus2 },
    { to: "/history", label: "History", icon: History },
    { to: "/settings", label: "Setup", icon: Settings },
    ...(isAdmin ? [{ to: "/admin", label: "Users", icon: Users }] : []),
  ] as const;

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur print:hidden">
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <h1 className="truncate font-mono text-lg font-bold uppercase tracking-tight">{title}</h1>
          <div className="flex items-center gap-2">
            {actions}
            <nav className="hidden gap-1 md:flex">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
                  activeProps={{ className: "bg-secondary text-foreground" }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <button onClick={signOut} aria-label="Sign out" className="rounded-md p-2 text-muted-foreground hover:bg-secondary">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-4">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden print:hidden">
        <div className="flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs text-muted-foreground"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              <n.icon className="h-5 w-5" />
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

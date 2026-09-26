import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bootstrapAdmin, hasAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Receipt Printer" },
      { name: "description", content: "Sign in to print your receipts." },
      { property: "og:title", content: "Sign in — Receipt Printer" },
      { property: "og:description", content: "Sign in to print your receipts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [setup, setSetup] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/new", replace: true });
    });
    hasAdmin().then((r) => setSetup(!r.exists)).catch(() => {});
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (setup) {
        const r = await bootstrapAdmin({ data: { email, password } });
        if (!r.ok) { toast.error(r.error); return; }
        toast.success("Super admin created");
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/new", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="receipt-paper w-full max-w-sm space-y-4 rounded-sm p-6 shadow-xl">
        <div className="text-center">
          <img src="/icon-192.png" alt="" className="mx-auto mb-3 h-14 w-14 rounded-xl" />
          <h1 className="text-xl font-bold uppercase">Receipt Printer</h1>
          <p className="mt-1 text-xs opacity-70">
            {setup ? "First time setup — create the super admin account" : "Sign in with the account you were given"}
          </p>
        </div>
        <div className="border-t border-dashed border-ink/40" />
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={setup ? "new-password" : "current-password"} />
          {setup && <p className="text-[11px] opacity-60">Use a strong, unique password — common passwords are rejected.</p>}
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Please wait…" : setup ? "Create admin & sign in" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

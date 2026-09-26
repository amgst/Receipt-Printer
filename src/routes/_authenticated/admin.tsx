import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { KeyRound, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AppShell, useIsAdmin } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAppUser, deleteAppUser, listUsers, setUserPassword } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Users — Receipt Printer" },
      { name: "description", content: "Manage who can use the receipt printer." },
      { property: "og:title", content: "Users — Receipt Printer" },
      { property: "og:description", content: "Manage who can use the receipt printer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { data: isAdmin, isLoading: checking } = useIsAdmin();
  const qc = useQueryClient();
  const list = useServerFn(listUsers);
  const create = useServerFn(createAppUser);
  const del = useServerFn(deleteAppUser);
  const setPw = useServerFn(setUserPassword);
  const { data: users, isLoading } = useQuery({ queryKey: ["users"], queryFn: () => list(), enabled: !!isAdmin });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (checking) return <AppShell title="Users"><p className="text-muted-foreground">Loading…</p></AppShell>;
  if (!isAdmin) return <AppShell title="Users"><p className="text-muted-foreground">Only the super admin can manage users.</p></AppShell>;

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await create({ data: { email, password } });
      if (!r.ok) { toast.error(r.error); return; }
      toast.success(`Account created for ${email}`);
      setEmail("");
      setPassword("");
      qc.invalidateQueries({ queryKey: ["users"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Users">
      <form onSubmit={add} className="mb-6 grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Email</Label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Password (min 6)</Label>
          <Input type="text" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy}><UserPlus className="h-4 w-4" /> Add user</Button>
      </form>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {users?.map((u) => (
            <li key={u.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {u.email} {u.isAdmin && <span className="ml-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">Admin</span>}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last sign in: {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "never"}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" aria-label="Change password" onClick={async () => {
                  const pw = prompt(`New password for ${u.email}`);
                  if (!pw) return;
                  try { const r = await setPw({ data: { id: u.id, password: pw } }); if (!r.ok) toast.error(r.error); else toast.success("Password changed"); }
                  catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
                }}><KeyRound className="h-4 w-4" /></Button>
                {!u.isAdmin && (
                  <Button variant="ghost" size="icon" aria-label="Delete user" onClick={async () => {
                    if (!confirm(`Delete ${u.email} and all their receipts?`)) return;
                    try { await del({ data: { id: u.id } }); qc.invalidateQueries({ queryKey: ["users"] }); toast.success("User deleted"); }
                    catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
                  }}><Trash2 className="h-4 w-4" /></Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}

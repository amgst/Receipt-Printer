import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Download, Plus, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Receipt } from "@/components/Receipt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { addReceipt } from "@/integrations/firebase/data";
import { loadSettings, money, randDigits, totals, type ReceiptData, type ShopSettings } from "@/lib/receipt";
import { saveReceiptImage } from "@/lib/save-receipt-image";

export const Route = createFileRoute("/_authenticated/new")({
  head: () => ({
    meta: [
      { title: "New receipt — Receipt Printer" },
      { name: "description", content: "Fill in a receipt and print it." },
      { property: "og:title", content: "New receipt — Receipt Printer" },
      { property: "og:description", content: "Fill in a receipt and print it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewReceipt,
});

function now() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    time: `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`,
  };
}

function blank(s: ShopSettings): ReceiptData {
  return {
    items: [{ qty: 1, name: "", price: 0 }],
    ...now(),
    storeNumber: s.store_number ?? "",
    register: s.register_number ?? "",
    cashier: s.cashier ?? "",
    trans: randDigits(12),
    taxRate: Number(s.tax_rate) || 0,
    showQr: !!s.qr_url,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function NewReceipt() {
  const qc = useQueryClient();
  const { data: shop } = useQuery({ queryKey: ["settings"], queryFn: loadSettings });
  const [d, setD] = useState<ReceiptData | null>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (shop && !d) setD(blank(shop));
  }, [shop, d]);

  if (!shop || !d) return <AppShell title="New receipt"><p className="text-muted-foreground">Loading…</p></AppShell>;

  const set = <K extends keyof ReceiptData>(k: K, v: ReceiptData[K]) => setD({ ...d, [k]: v });
  const setItem = (i: number, patch: Partial<ReceiptData["items"][number]>) =>
    set("items", d.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const saveAndPrint = async () => {
    if (!d.items.some((i) => i.name.trim())) { toast.error("Add at least one item"); return; }
    setSaving(true);
    try {
      await addReceipt({ trans_number: d.trans, total: totals(d).total, data: d });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save receipt");
      setSaving(false);
      return;
    }
    setSaving(false);
    qc.invalidateQueries({ queryKey: ["receipts"] });
    toast.success("Saved");
    setTimeout(() => window.print(), 100);
  };

  const saveToGallery = async () => {
    if (!d.items.some((i) => i.name.trim())) { toast.error("Add at least one item"); return; }
    const element = document.getElementById("print-area");
    if (!element) return;
    setExporting(true);
    try {
      await saveReceiptImage(element, d.trans);
    } catch {
      toast.error("Could not save the receipt image. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppShell title="New receipt">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5 print:hidden">
          <section className="space-y-3 rounded-lg border bg-card p-4">
            <h2 className="font-mono text-sm font-bold uppercase">Items</h2>
            {d.items.map((it, i) => (
              <div key={i} className="grid grid-cols-[3.5rem_minmax(0,1fr)_5.5rem_auto] items-end gap-2 border-b pb-3 last:border-0">
                <Field label="Qty">
                  <Input type="number" inputMode="numeric" min={1} value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) })} />
                </Field>
                <Field label="Item name">
                  <Input value={it.name} onChange={(e) => setItem(i, { name: e.target.value })} placeholder="Medicine name" />
                </Field>
                <Field label="Price">
                  <Input type="number" inputMode="decimal" step="0.01" value={it.price || ""} onChange={(e) => setItem(i, { price: Number(e.target.value) })} />
                </Field>
                <Button variant="ghost" size="icon" aria-label="Remove item" onClick={() => set("items", d.items.filter((_, x) => x !== i))} disabled={d.items.length === 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => set("items", [...d.items, { qty: 1, name: "", price: 0 }])}>
              <Plus className="h-4 w-4" /> Add item
            </Button>
          </section>

          {shop.qr_url && (
            <section className="rounded-lg border bg-card p-4">
              <label className="flex items-center justify-between text-sm">
                Show QR code
                <Switch checked={d.showQr} onCheckedChange={(v) => set("showQr", v)} />
              </label>
            </section>
          )}
        </div>

        <div className="md:sticky md:top-20 md:self-start">
          <Receipt id="print-area" shop={shop} data={d} />
           <div className="mt-4 flex flex-wrap gap-2 print:hidden">
            <Button variant="outline" onClick={() => setD(blank(shop))}>Clear</Button>
             <Button variant="outline" className="flex-1" onClick={saveToGallery} disabled={exporting}>
               <Download className="h-4 w-4" /> Save to gallery
             </Button>
             <Button className="w-full" onClick={saveAndPrint} disabled={saving}>
               <Printer className="h-4 w-4" /> Save & print · {money(totals(d).total)}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

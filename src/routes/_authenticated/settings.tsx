import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Receipt } from "@/components/Receipt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveSettings } from "@/integrations/firebase/data";
import { loadSettings, type ReceiptData, type ShopSettings } from "@/lib/receipt";
import {
  isThermalPrinterApp,
  listPairedPrinters,
  selectedPrinter,
  selectPrinter,
  type PairedPrinter,
} from "@/lib/thermal-printer";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Store setup — Receipt Printer" },
      { name: "description", content: "Set your logo, store name and receipt details." },
      { property: "og:title", content: "Store setup — Receipt Printer" },
      { property: "og:description", content: "Set your logo, store name and receipt details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

const sample: ReceiptData = {
  items: [
    { qty: 2, name: "Sample medicine", price: 5.98 },
    { qty: 1, name: "Another medicine", price: 12.5 },
  ],
  date: "2026-01-01",
  time: "10:30:00",
  storeNumber: "",
  register: "",
  cashier: "",
  trans: "000000000000",
  taxRate: 0,
  showQr: true,
};

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const max = 480;
      const scale = Math.min(1, max / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: loadSettings });
  const [s, setS] = useState<ShopSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [printers, setPrinters] = useState<PairedPrinter[]>([]);
  const [printerAddress, setPrinterAddress] = useState("");
  const [loadingPrinters, setLoadingPrinters] = useState(false);

  useEffect(() => {
    if (data) setS(data);
  }, [data]);

  useEffect(() => {
    if (isThermalPrinterApp()) setPrinterAddress(selectedPrinter());
  }, []);

  const findPrinters = async () => {
    setLoadingPrinters(true);
    try {
      const devices = await listPairedPrinters();
      setPrinters(devices);
      if (!devices.length) toast.error("Pair the printer in Android Bluetooth settings first.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read paired printers");
    } finally {
      setLoadingPrinters(false);
    }
  };

  if (!s) return <AppShell title="Store setup"><p className="text-muted-foreground">Loading…</p></AppShell>;
  const set = <K extends keyof ShopSettings>(k: K, v: ShopSettings[K]) => setS({ ...s, [k]: v });

  const save = async () => {
    setSaving(true);
    const { user_id, ...rest } = s;
    try {
      await saveSettings({ ...rest, currency: "PKR", tax_rate: Number(rest.tax_rate) || 0 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save setup");
      setSaving(false);
      return;
    }
    setSaving(false);
    qc.invalidateQueries({ queryKey: ["settings"] });
    toast.success("Store setup saved");
  };

  const F = ({ label, k, ...p }: { label: string; k: keyof ShopSettings } & React.ComponentProps<typeof Input>) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={(s[k] as string | number | null) ?? ""} onChange={(e) => set(k, e.target.value as never)} {...p} />
    </div>
  );

  return (
    <AppShell title="Store setup">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="space-y-3 rounded-lg border bg-card p-4">
            <h2 className="font-mono text-sm font-bold uppercase">Logo & name</h2>
            <div className="flex items-center gap-3">
              <div className="grid h-16 w-24 shrink-0 place-items-center rounded border bg-paper">
                {s.logo_data ? <img src={s.logo_data} alt="Logo" className="max-h-14 max-w-20 object-contain" /> : <span className="text-xs text-muted-foreground">No logo</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer rounded-md border px-3 py-1.5 text-sm hover:bg-secondary">
                  Upload logo
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) set("logo_data", await resizeImage(f));
                  }} />
                </label>
                {s.logo_data && <Button variant="ghost" size="sm" onClick={() => set("logo_data", null)}>Remove</Button>}
              </div>
            </div>
            {F({ label: "Business name", k: "business_name" })}
            {F({ label: "Tagline (optional)", k: "tagline" })}
          </section>

          <section className="grid grid-cols-2 gap-3 rounded-lg border bg-card p-4">
            <h2 className="col-span-2 font-mono text-sm font-bold uppercase">Store info</h2>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground">Address</Label>
              <Textarea rows={2} value={s.address ?? ""} onChange={(e) => set("address", e.target.value)} />
            </div>
            {F({ label: "Phone", k: "phone" })}
            {F({ label: "Store #", k: "store_number" })}
            {F({ label: "Default register #", k: "register_number" })}
            {F({ label: "Default cashier", k: "cashier" })}
            {F({ label: "Default tax %", k: "tax_rate", type: "number", step: "0.01" })}
          </section>

          <section className="space-y-3 rounded-lg border bg-card p-4">
            <h2 className="font-mono text-sm font-bold uppercase">Extras</h2>
            {F({ label: "QR code link (optional)", k: "qr_url", placeholder: "https://…" })}
          </section>

          {isThermalPrinterApp() && (
            <section className="space-y-3 rounded-lg border bg-card p-4">
              <h2 className="font-mono text-sm font-bold uppercase">Thermal printer</h2>
              <Button variant="outline" className="w-full" onClick={findPrinters} disabled={loadingPrinters}>
                {loadingPrinters ? "Finding paired printers…" : "Find paired printers"}
              </Button>
              {!!printers.length && (
                <select
                  aria-label="Bluetooth printer"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={printerAddress}
                  onChange={(event) => {
                    setPrinterAddress(event.target.value);
                    selectPrinter(event.target.value);
                    toast.success("Printer selected");
                  }}
                >
                  <option value="">Choose a printer</option>
                  {printers.map((printer) => (
                    <option key={printer.address} value={printer.address}>{printer.name}</option>
                  ))}
                </select>
              )}
            </section>
          )}

          <Button className="w-full" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save setup"}</Button>
        </div>
        <div className="md:sticky md:top-20 md:self-start">
          <p className="mb-2 text-center text-xs text-muted-foreground">Preview</p>
          <Receipt shop={s} data={{ ...sample, taxRate: Number(s.tax_rate) || 0, storeNumber: s.store_number ?? "", register: s.register_number ?? "", cashier: s.cashier ?? "" }} />
        </div>
      </div>
    </AppShell>
  );
}

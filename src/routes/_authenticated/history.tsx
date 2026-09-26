import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Receipt } from "@/components/Receipt";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { deleteReceipt, listReceipts } from "@/integrations/firebase/data";
import { loadSettings, money, type ReceiptData } from "@/lib/receipt";
import { saveReceiptImage } from "@/lib/save-receipt-image";
import { printReceipt } from "@/lib/thermal-printer";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "History — Receipt Printer" },
      { name: "description", content: "Your saved receipts." },
      { property: "og:title", content: "History — Receipt Printer" },
      { property: "og:description", content: "Your saved receipts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoryPage,
});

type Row = { id: string; trans_number: string; total: number; created_at: string; data: ReceiptData };

function HistoryPage() {
  const qc = useQueryClient();
  const { data: shop } = useQuery({ queryKey: ["settings"], queryFn: loadSettings });
  const { data: rows, isLoading } = useQuery({
    queryKey: ["receipts"],
    queryFn: async () => {
      return listReceipts<Row>();
    },
  });
  const [open, setOpen] = useState<Row | null>(null);
  const [exporting, setExporting] = useState(false);

  const remove = async (id: string) => {
    if (!confirm("Delete this receipt?")) return;
    try { await deleteReceipt(id); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete receipt"); return; }
    setOpen(null);
    qc.invalidateQueries({ queryKey: ["receipts"] });
  };

  const saveToGallery = async () => {
    if (!open) return;
    const element = document.getElementById("print-area");
    if (!element) return;
    setExporting(true);
    try {
      await saveReceiptImage(element, open.trans_number);
    } catch {
      toast.error("Could not save the receipt image. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppShell title="History">
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !rows?.length ? (
        <p className="py-12 text-center text-muted-foreground">No receipts yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {rows.map((r) => (
            <li key={r.id}>
              <button onClick={() => setOpen(r)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left hover:bg-secondary">
                <div className="min-w-0">
                  <div className="truncate font-mono text-sm">#{r.trans_number}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()} · {r.data.items.filter((i) => i.name).length} items
                  </div>
                </div>
                 <div className="font-mono font-bold">{money(Number(r.total))}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto bg-background">
          <DialogTitle className="sr-only">Receipt</DialogTitle>
          {open && shop && (
            <>
              <Receipt id="print-area" shop={shop} data={open.data} />
               <div className="flex flex-wrap gap-2 print:hidden">
                 <Button variant="outline" aria-label="Delete receipt" onClick={() => remove(open.id)}><Trash2 className="h-4 w-4" /></Button>
                 <Button variant="outline" className="flex-1" onClick={saveToGallery} disabled={exporting}><Download className="h-4 w-4" /> Save to gallery</Button>
                 <Button className="flex-1" onClick={async () => {
                   const element = document.getElementById("print-area");
                   if (!element) return;
                   try { await printReceipt(element); }
                   catch (error) { toast.error(error instanceof Error ? error.message : "Could not print receipt"); }
                 }}><Printer className="h-4 w-4" /> Reprint</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

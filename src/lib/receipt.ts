import { currentUser } from "@/integrations/firebase/client";
import { getSettings, saveSettings } from "@/integrations/firebase/data";

export type ShopSettings = {
  user_id: string;
  business_name: string;
  tagline: string | null;
  logo_data: string | null;
  address: string | null;
  phone: string | null;
  store_number: string | null;
  register_number: string | null;
  cashier: string | null;
  tax_rate: number;
  currency: string;
  footer_text: string | null;
  footer_note: string | null;
  qr_url: string | null;
};

export type ReceiptItem = { qty: number; name: string; price: number };

export type ReceiptData = {
  items: ReceiptItem[];
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  storeNumber: string;
  register: string;
  cashier: string;
  trans: string;
  taxRate: number;
  showQr: boolean;
};

export function money(n: number) {
  return `PKR ${(Number.isFinite(n) ? n : 0).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function totals(d: ReceiptData) {
  const subtotal = d.items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  const tax = Math.round(subtotal * (Number(d.taxRate) || 0)) / 100;
  return { subtotal, tax, total: subtotal + tax };
}

export function randDigits(n: number) {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

export function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${m}/${d}/${y}` : iso;
}

export function fmtTime(t: string) {
  const [hh, mm, ss = "00"] = t.split(":");
  let h = Number(hh);
  if (!Number.isFinite(h)) return t;
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mm}:${ss} ${ap}`;
}

export async function loadSettings(): Promise<ShopSettings> {
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in.");
  const existing = await getSettings<ShopSettings>();
  if (existing) return { ...existing, currency: "PKR" };
  const created: ShopSettings = {
    user_id: user.uid, business_name: "My Store", tagline: null, logo_data: null,
    address: null, phone: null, store_number: null, register_number: null,
    cashier: null, tax_rate: 0, currency: "PKR", footer_text: null,
    footer_note: null, qr_url: null,
  };
  const { user_id: _userId, ...settings } = created;
  await saveSettings(settings);
  return created;
}

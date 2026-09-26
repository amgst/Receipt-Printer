import { supabase } from "@/integrations/supabase/client";

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
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user!.id;
  const { data } = await supabase.from("shop_settings").select("*").eq("user_id", uid).maybeSingle();
  if (data) return { ...data, currency: "PKR" } as unknown as ShopSettings;
  const { data: created, error } = await supabase
    .from("shop_settings")
    .insert({ user_id: uid, currency: "PKR" })
    .select("*")
    .single();
  if (error) throw error;
  return { ...created, currency: "PKR" } as unknown as ShopSettings;
}

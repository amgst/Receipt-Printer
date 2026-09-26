import { QRCodeSVG } from "qrcode.react";
import { fmtDate, fmtTime, money, totals, type ReceiptData, type ShopSettings } from "@/lib/receipt";

function Row({ l, r, bold }: { l: string; r: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-2 ${bold ? "font-bold" : ""}`}>
      <span className="uppercase">{l}</span>
      <span className="text-right uppercase">{r}</span>
    </div>
  );
}

export function Receipt({ shop, data, id }: { shop: ShopSettings; data: ReceiptData; id?: string }) {
  const { subtotal, tax, total } = totals(data);
  const dash = <div className="my-2 border-t border-dashed border-ink/50" />;
  const solid = <div className="my-2 border-t border-ink/40" />;

  return (
    <div id={id} className="receipt-paper mx-auto w-full max-w-[340px] px-4 py-6 text-[11px] leading-[1.4] shadow-lg">
      <div className="text-center">
        {shop.logo_data ? (
          <img src={shop.logo_data} alt={shop.business_name} className="mx-auto mb-2 max-h-20 max-w-[85%] object-contain" />
        ) : (
          <div className="mb-1 text-lg font-bold uppercase">{shop.business_name}</div>
        )}
        {shop.logo_data && shop.business_name && <div className="font-bold uppercase">{shop.business_name}</div>}
        {shop.tagline && <div>{shop.tagline}</div>}
        {shop.store_number && <div>Store #{shop.store_number}</div>}
        {shop.address && <div className="whitespace-pre-line">{shop.address}</div>}
        {shop.phone && <div>{shop.phone}</div>}
      </div>
      {solid}
      {data.storeNumber && <Row l="Store #" r={data.storeNumber} />}
      {data.register && <Row l="Reg #" r={data.register} />}
      {data.cashier && <Row l="Cashier" r={data.cashier} />}
      {data.trans && <Row l="Trans #" r={data.trans} />}
      <div className="mt-1 flex justify-between">
        <span>DATE: {fmtDate(data.date)}</span>
        <span>TIME: {fmtTime(data.time)}</span>
      </div>
      {dash}
      <div className="mb-1 grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] gap-1 border-b border-ink/40 pb-1 font-bold uppercase">
        <span>Price</span><span className="text-center">Qty</span><span className="text-right">Total</span>
      </div>
      <div className="space-y-1.5">
        {data.items
          .filter((i) => i.name.trim())
          .map((i, idx) => (
            <div key={idx}>
              <div className="font-bold uppercase">{i.name}</div>
              <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] gap-1">
                <span>{money(i.price)}</span>
                <span className="text-center">{i.qty}</span>
                <span className="text-right">{money(i.qty * i.price)}</span>
              </div>
            </div>
          ))}
      </div>
      {dash}
      <Row l="Subtotal" r={money(subtotal)} />
      <Row l={`Tax (${Number(data.taxRate) || 0}%)`} r={money(tax)} />
      {solid}
      <div className="text-[12px]">
        <Row l="Total" r={money(total)} bold />
      </div>
      {data.showQr && shop.qr_url && (
        <div className="mt-3 flex flex-col items-center gap-2 text-center">
          <QRCodeSVG value={shop.qr_url} size={96} bgColor="transparent" />
          <div>{shop.qr_url.replace(/^https?:\/\//, "")}</div>
        </div>
      )}
    </div>
  );
}

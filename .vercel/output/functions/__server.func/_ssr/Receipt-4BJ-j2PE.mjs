import { r as currentUser } from "./client-NVwGIq0n.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as getSettings, o as saveSettings } from "./AppShell-G-Ilr2C3.mjs";
import { t as QRCodeSVG } from "../_libs/qrcode.react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Receipt-4BJ-j2PE.js
var import_jsx_runtime = require_jsx_runtime();
function money(n) {
	return `PKR ${(Number.isFinite(n) ? n : 0).toLocaleString("en-PK", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})}`;
}
function totals(d) {
	const subtotal = d.items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
	const tax = Math.round(subtotal * (Number(d.taxRate) || 0)) / 100;
	return {
		subtotal,
		tax,
		total: subtotal + tax
	};
}
function randDigits(n) {
	let s = "";
	for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
	return s;
}
function fmtDate(iso) {
	const [y, m, d] = iso.split("-");
	return y && m && d ? `${m}/${d}/${y}` : iso;
}
function fmtTime(t) {
	const [hh, mm, ss = "00"] = t.split(":");
	let h = Number(hh);
	if (!Number.isFinite(h)) return t;
	const ap = h >= 12 ? "PM" : "AM";
	h = h % 12 || 12;
	return `${h}:${mm}:${ss} ${ap}`;
}
async function loadSettings() {
	const user = await currentUser();
	if (!user) throw new Error("You must be signed in.");
	const existing = await getSettings();
	if (existing) return {
		...existing,
		currency: "PKR"
	};
	const created = {
		user_id: user.uid,
		business_name: "My Store",
		tagline: null,
		logo_data: null,
		address: null,
		phone: null,
		store_number: null,
		register_number: null,
		cashier: null,
		tax_rate: 0,
		currency: "PKR",
		footer_text: null,
		footer_note: null,
		qr_url: null
	};
	const { user_id: _userId, ...settings } = created;
	await saveSettings(settings);
	return created;
}
function Row({ l, r, bold }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex justify-between gap-2 ${bold ? "font-bold" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "uppercase",
			children: l
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-right uppercase",
			children: r
		})]
	});
}
function Receipt({ shop, data, id }) {
	const { subtotal, tax, total } = totals(data);
	const dash = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-2 border-t border-dashed border-ink/50" });
	const solid = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-2 border-t border-ink/40" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id,
		className: "receipt-paper mx-auto w-full max-w-[340px] px-4 py-6 text-[11px] leading-[1.4] shadow-lg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center",
				children: [
					shop.logo_data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: shop.logo_data,
						alt: shop.business_name,
						className: "mx-auto mb-2 max-h-20 max-w-[85%] object-contain"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-1 text-lg font-bold uppercase",
						children: shop.business_name
					}),
					shop.logo_data && shop.business_name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-bold uppercase",
						children: shop.business_name
					}),
					shop.tagline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: shop.tagline }),
					shop.store_number && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Store #", shop.store_number] }),
					shop.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "whitespace-pre-line",
						children: shop.address
					}),
					shop.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: shop.phone })
				]
			}),
			solid,
			data.storeNumber && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				l: "Store #",
				r: data.storeNumber
			}),
			data.register && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				l: "Reg #",
				r: data.register
			}),
			data.cashier && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				l: "Cashier",
				r: data.cashier
			}),
			data.trans && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				l: "Trans #",
				r: data.trans
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["DATE: ", fmtDate(data.date)] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["TIME: ", fmtTime(data.time)] })]
			}),
			dash,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] gap-1 border-b border-ink/40 pb-1 font-bold uppercase",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Price" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-center",
						children: "Qty"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-right",
						children: "Total"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-1.5",
				children: data.items.filter((i) => i.name.trim()).map((i, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-bold uppercase",
					children: i.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: money(i.price) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-center",
							children: i.qty
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-right",
							children: money(i.qty * i.price)
						})
					]
				})] }, idx))
			}),
			dash,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				l: "Subtotal",
				r: money(subtotal)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				l: `Tax (${Number(data.taxRate) || 0}%)`,
				r: money(tax)
			}),
			solid,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[12px]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					l: "Total",
					r: money(total),
					bold: true
				})
			}),
			data.showQr && shop.qr_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-col items-center gap-2 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRCodeSVG, {
					value: shop.qr_url,
					size: 96,
					bgColor: "transparent"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: shop.qr_url.replace(/^https?:\/\//, "") })]
			})
		]
	});
}
//#endregion
export { totals as a, randDigits as i, loadSettings as n, money as r, Receipt as t };

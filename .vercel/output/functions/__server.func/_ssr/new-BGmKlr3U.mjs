import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { f as Download, i as Trash2, o as Printer, s as Plus } from "../_libs/lucide-react.mjs";
import { n as addReceipt, t as AppShell } from "./AppShell-G-Ilr2C3.mjs";
import { n as cn, t as Button } from "./button-DRsC1qZi.mjs";
import { n as Label, t as Input } from "./label-CmIE8x5o.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as totals, i as randDigits, n as loadSettings, r as money, t as Receipt } from "./Receipt-4BJ-j2PE.mjs";
import { t as saveReceiptImage } from "./save-receipt-image-BMGILkai.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/@radix-ui/react-switch+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-BGmKlr3U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
function now() {
	const d = /* @__PURE__ */ new Date();
	const p = (n) => String(n).padStart(2, "0");
	return {
		date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
		time: `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
	};
}
function blank(s) {
	return {
		items: [{
			qty: 1,
			name: "",
			price: 0
		}],
		...now(),
		storeNumber: s.store_number ?? "",
		register: s.register_number ?? "",
		cashier: s.cashier ?? "",
		trans: randDigits(12),
		taxRate: Number(s.tax_rate) || 0,
		showQr: !!s.qr_url
	};
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-xs text-muted-foreground",
			children: label
		}), children]
	});
}
function NewReceipt() {
	const qc = useQueryClient();
	const { data: shop } = useQuery({
		queryKey: ["settings"],
		queryFn: loadSettings
	});
	const [d, setD] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [exporting, setExporting] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (shop && !d) setD(blank(shop));
	}, [shop, d]);
	if (!shop || !d) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "New receipt",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "Loading…"
		})
	});
	const set = (k, v) => setD({
		...d,
		[k]: v
	});
	const setItem = (i, patch) => set("items", d.items.map((it, idx) => idx === i ? {
		...it,
		...patch
	} : it));
	const saveAndPrint = async () => {
		if (!d.items.some((i) => i.name.trim())) {
			toast.error("Add at least one item");
			return;
		}
		setSaving(true);
		try {
			await addReceipt({
				trans_number: d.trans,
				total: totals(d).total,
				data: d
			});
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
		if (!d.items.some((i) => i.name.trim())) {
			toast.error("Add at least one item");
			return;
		}
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "New receipt",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 md:grid-cols-[minmax(0,1fr)_360px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 print:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-3 rounded-lg border bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-mono text-sm font-bold uppercase",
							children: "Items"
						}),
						d.items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-[3.5rem_minmax(0,1fr)_5.5rem_auto] items-end gap-2 border-b pb-3 last:border-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Qty",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										inputMode: "numeric",
										min: 1,
										value: it.qty,
										onChange: (e) => setItem(i, { qty: Number(e.target.value) })
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Item name",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: it.name,
										onChange: (e) => setItem(i, { name: e.target.value }),
										placeholder: "Medicine name"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Price",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										inputMode: "decimal",
										step: "0.01",
										value: it.price || "",
										onChange: (e) => setItem(i, { price: Number(e.target.value) })
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": "Remove item",
									onClick: () => set("items", d.items.filter((_, x) => x !== i)),
									disabled: d.items.length === 1,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
								})
							]
						}, i)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "w-full",
							onClick: () => set("items", [...d.items, {
								qty: 1,
								name: "",
								price: 0
							}]),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add item"]
						})
					]
				}), shop.qr_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "rounded-lg border bg-card p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center justify-between text-sm",
						children: ["Show QR code", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: d.showQr,
							onCheckedChange: (v) => set("showQr", v)
						})]
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:sticky md:top-20 md:self-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, {
					id: "print-area",
					shop,
					data: d
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2 print:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setD(blank(shop)),
							children: "Clear"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "flex-1",
							onClick: saveToGallery,
							disabled: exporting,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), " Save to gallery"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "w-full",
							onClick: saveAndPrint,
							disabled: saving,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-4 w-4" }),
								" Save & print · ",
								money(totals(d).total)
							]
						})
					]
				})]
			})]
		})
	});
}
//#endregion
export { NewReceipt as component };

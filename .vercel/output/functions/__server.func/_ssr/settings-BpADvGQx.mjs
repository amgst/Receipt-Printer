import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { o as saveSettings, t as AppShell } from "./AppShell-G-Ilr2C3.mjs";
import { n as cn, t as Button } from "./button-DRsC1qZi.mjs";
import { n as Label, t as Input } from "./label-CmIE8x5o.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as loadSettings, t as Receipt } from "./Receipt-4BJ-j2PE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BpADvGQx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var sample = {
	items: [{
		qty: 2,
		name: "Sample medicine",
		price: 5.98
	}, {
		qty: 1,
		name: "Another medicine",
		price: 12.5
	}],
	date: "2026-01-01",
	time: "10:30:00",
	storeNumber: "",
	register: "",
	cashier: "",
	trans: "000000000000",
	taxRate: 0,
	showQr: true
};
function resizeImage(file) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const scale = Math.min(1, 480 / img.width);
			const c = document.createElement("canvas");
			c.width = Math.round(img.width * scale);
			c.height = Math.round(img.height * scale);
			c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
			resolve(c.toDataURL("image/png"));
		};
		img.onerror = reject;
		img.src = URL.createObjectURL(file);
	});
}
function SettingsPage() {
	const qc = useQueryClient();
	const { data } = useQuery({
		queryKey: ["settings"],
		queryFn: loadSettings
	});
	const [s, setS] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (data) setS(data);
	}, [data]);
	if (!s) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Store setup",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "Loading…"
		})
	});
	const set = (k, v) => setS({
		...s,
		[k]: v
	});
	const save = async () => {
		setSaving(true);
		const { user_id, ...rest } = s;
		try {
			await saveSettings({
				...rest,
				currency: "PKR",
				tax_rate: Number(rest.tax_rate) || 0
			});
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not save setup");
			setSaving(false);
			return;
		}
		setSaving(false);
		qc.invalidateQueries({ queryKey: ["settings"] });
		toast.success("Store setup saved");
	};
	const F = ({ label, k, ...p }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-xs text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			value: s[k] ?? "",
			onChange: (e) => set(k, e.target.value),
			...p
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Store setup",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 md:grid-cols-[minmax(0,1fr)_360px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "space-y-3 rounded-lg border bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-mono text-sm font-bold uppercase",
								children: "Logo & name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-16 w-24 shrink-0 place-items-center rounded border bg-paper",
									children: s.logo_data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: s.logo_data,
										alt: "Logo",
										className: "max-h-14 max-w-20 object-contain"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "No logo"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "cursor-pointer rounded-md border px-3 py-1.5 text-sm hover:bg-secondary",
										children: ["Upload logo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "file",
											accept: "image/*",
											className: "hidden",
											onChange: async (e) => {
												const f = e.target.files?.[0];
												if (f) set("logo_data", await resizeImage(f));
											}
										})]
									}), s.logo_data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										onClick: () => set("logo_data", null),
										children: "Remove"
									})]
								})]
							}),
							F({
								label: "Business name",
								k: "business_name"
							}),
							F({
								label: "Tagline (optional)",
								k: "tagline"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid grid-cols-2 gap-3 rounded-lg border bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "col-span-2 font-mono text-sm font-bold uppercase",
								children: "Store info"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "col-span-2 space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground",
									children: "Address"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 2,
									value: s.address ?? "",
									onChange: (e) => set("address", e.target.value)
								})]
							}),
							F({
								label: "Phone",
								k: "phone"
							}),
							F({
								label: "Store #",
								k: "store_number"
							}),
							F({
								label: "Default register #",
								k: "register_number"
							}),
							F({
								label: "Default cashier",
								k: "cashier"
							}),
							F({
								label: "Default tax %",
								k: "tax_rate",
								type: "number",
								step: "0.01"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "space-y-3 rounded-lg border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-mono text-sm font-bold uppercase",
							children: "Extras"
						}), F({
							label: "QR code link (optional)",
							k: "qr_url",
							placeholder: "https://…"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						onClick: save,
						disabled: saving,
						children: saving ? "Saving…" : "Save setup"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:sticky md:top-20 md:self-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-center text-xs text-muted-foreground",
					children: "Preview"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, {
					shop: s,
					data: {
						...sample,
						taxRate: Number(s.tax_rate) || 0,
						storeNumber: s.store_number ?? "",
						register: s.register_number ?? "",
						cashier: s.cashier ?? ""
					}
				})]
			})]
		})
	});
}
//#endregion
export { SettingsPage as component };

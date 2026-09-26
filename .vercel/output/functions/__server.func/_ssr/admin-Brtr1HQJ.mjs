import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { D as isRedirect, _ as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as Trash2, l as KeyRound, r as UserPlus } from "../_libs/lucide-react.mjs";
import { s as useIsAdmin, t as AppShell } from "./AppShell-G-Ilr2C3.mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { n as Label, t as Input } from "./label-CmIE8x5o.mjs";
import { a as listUsers, n as createAppUser, o as setUserPassword, r as deleteAppUser } from "./admin.functions-pToXWYSb.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-Brtr1HQJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
function AdminPage() {
	const { data: isAdmin, isLoading: checking } = useIsAdmin();
	const qc = useQueryClient();
	const list = useServerFn(listUsers);
	const create = useServerFn(createAppUser);
	const del = useServerFn(deleteAppUser);
	const setPw = useServerFn(setUserPassword);
	const { data: users, isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: () => list(),
		enabled: !!isAdmin
	});
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (checking) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Users",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "Loading…"
		})
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Users",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "Only the super admin can manage users."
		})
	});
	const add = async (e) => {
		e.preventDefault();
		setBusy(true);
		try {
			const r = await create({ data: {
				email,
				password
			} });
			if (!r.ok) {
				toast.error(r.error);
				return;
			}
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Users",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: add,
			className: "mb-6 grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs text-muted-foreground",
						children: "Email"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "email",
						required: true,
						value: email,
						onChange: (e) => setEmail(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs text-muted-foreground",
						children: "Password (min 6)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "text",
						required: true,
						minLength: 6,
						value: password,
						onChange: (e) => setPassword(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					disabled: busy,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-4 w-4" }), " Add user"]
				})
			]
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "Loading…"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y rounded-lg border bg-card",
			children: users?.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "truncate text-sm font-medium",
						children: [
							u.email,
							" ",
							u.isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground",
								children: "Admin"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: ["Last sign in: ", u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "never"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Change password",
						onClick: async () => {
							const pw = prompt(`New password for ${u.email}`);
							if (!pw) return;
							try {
								const r = await setPw({ data: {
									id: u.id,
									password: pw
								} });
								if (!r.ok) toast.error(r.error);
								else toast.success("Password changed");
							} catch (err) {
								toast.error(err instanceof Error ? err.message : "Failed");
							}
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-4 w-4" })
					}), !u.isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Delete user",
						onClick: async () => {
							if (!confirm(`Delete ${u.email} and all their receipts?`)) return;
							try {
								await del({ data: { id: u.id } });
								qc.invalidateQueries({ queryKey: ["users"] });
								toast.success("User deleted");
							} catch (err) {
								toast.error(err instanceof Error ? err.message : "Failed");
							}
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
					})]
				})]
			}, u.id))
		})]
	});
}
//#endregion
export { AdminPage as component };

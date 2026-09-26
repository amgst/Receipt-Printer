import "../_libs/firebase.mjs";
import { i as signOut } from "../_libs/firebase__auth.mjs";
import { a as limit, c as setDoc, f as serverTimestamp, i as getDocs, l as collection, n as deleteDoc, o as orderBy, r as getDoc, s as query, t as addDoc, u as doc } from "../_libs/@firebase/firestore+[...].mjs";
import { i as db, r as currentUser, t as auth } from "./client-NVwGIq0n.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as Settings, c as LogOut, d as FilePlusCorner, n as Users, u as History } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppShell-G-Ilr2C3.js
var import_jsx_runtime = require_jsx_runtime();
async function uid() {
	const user = await currentUser();
	if (!user) throw new Error("You must be signed in.");
	return user.uid;
}
async function getUserRole() {
	const userId = await uid();
	return (await getDoc(doc(db, "users", userId))).data()?.["role"];
}
async function getSettings() {
	const userId = await uid();
	const snapshot = await getDoc(doc(db, "shop_settings", userId));
	return snapshot.exists() ? {
		user_id: userId,
		...snapshot.data()
	} : null;
}
async function saveSettings(data) {
	const userId = await uid();
	await setDoc(doc(db, "shop_settings", userId), {
		...data,
		updated_at: serverTimestamp()
	}, { merge: true });
}
async function addReceipt(data) {
	const userId = await uid();
	await addDoc(collection(db, "users", userId, "receipts"), {
		...data,
		user_id: userId,
		created_at: serverTimestamp()
	});
}
async function listReceipts() {
	const userId = await uid();
	return (await getDocs(query(collection(db, "users", userId, "receipts"), orderBy("created_at", "desc"), limit(500)))).docs.map((item) => {
		const data = item.data();
		return {
			id: item.id,
			...data,
			created_at: data["created_at"]?.toDate?.().toISOString() ?? (/* @__PURE__ */ new Date()).toISOString()
		};
	});
}
async function deleteReceipt(id) {
	const userId = await uid();
	await deleteDoc(doc(db, "users", userId, "receipts", id));
}
function useIsAdmin() {
	return useQuery({
		queryKey: ["is-admin"],
		queryFn: async () => {
			return await getUserRole() === "admin";
		}
	});
}
function AppShell({ title, children, actions }) {
	const { data: isAdmin } = useIsAdmin();
	const qc = useQueryClient();
	const navigate = useNavigate();
	const signOut$1 = async () => {
		await qc.cancelQueries();
		qc.clear();
		await signOut(auth);
		navigate({
			to: "/auth",
			replace: true
		});
	};
	const nav = [
		{
			to: "/new",
			label: "New",
			icon: FilePlusCorner
		},
		{
			to: "/history",
			label: "History",
			icon: History
		},
		{
			to: "/settings",
			label: "Setup",
			icon: Settings
		},
		...isAdmin ? [{
			to: "/admin",
			label: "Users",
			icon: Users
		}] : []
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-24 md:pb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b bg-background/90 backdrop-blur print:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "truncate font-mono text-lg font-bold uppercase tracking-tight",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							actions,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
								className: "hidden gap-1 md:flex",
								children: nav.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: n.to,
									className: "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary",
									activeProps: { className: "bg-secondary text-foreground" },
									children: n.label
								}, n.to))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: signOut$1,
								"aria-label": "Sign out",
								className: "rounded-md p-2 text-muted-foreground hover:bg-secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-5 w-5" })
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-5xl px-4 py-4",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-20 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden print:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex",
					children: nav.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: n.to,
						className: "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs text-muted-foreground",
						activeProps: { className: "text-primary font-semibold" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(n.icon, { className: "h-5 w-5" }), n.label]
					}, n.to))
				})
			})
		]
	});
}
//#endregion
export { listReceipts as a, getSettings as i, addReceipt as n, saveSettings as o, deleteReceipt as r, useIsAdmin as s, AppShell as t };

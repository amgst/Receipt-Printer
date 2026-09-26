import { o as __toESM } from "../_runtime.mjs";
import "../_libs/firebase.mjs";
import { r as signInWithEmailAndPassword } from "../_libs/firebase__auth.mjs";
import { r as currentUser, t as auth } from "./client-NVwGIq0n.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { g as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Button } from "./button-DRsC1qZi.mjs";
import { n as Label, t as Input } from "./label-CmIE8x5o.mjs";
import { i as hasAdmin, t as bootstrapAdmin } from "./admin.functions-pToXWYSb.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-B9SNKYZp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [setup, setSetup] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		currentUser().then((user) => {
			if (user) navigate({
				to: "/new",
				replace: true
			});
		});
		hasAdmin().then((r) => setSetup(!r.exists)).catch(() => {});
	}, [navigate]);
	const submit = async (e) => {
		e.preventDefault();
		setBusy(true);
		try {
			if (setup) {
				const r = await bootstrapAdmin({ data: {
					email,
					password
				} });
				if (!r.ok) {
					toast.error(r.error);
					return;
				}
				toast.success("Super admin created");
			}
			await signInWithEmailAndPassword(auth, email, password);
			navigate({
				to: "/new",
				replace: true
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Sign in failed");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "receipt-paper w-full max-w-sm space-y-4 rounded-sm p-6 shadow-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/icon-192.png",
							alt: "",
							className: "mx-auto mb-3 h-14 w-14 rounded-xl"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-xl font-bold uppercase",
							children: "Receipt Printer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs opacity-70",
							children: setup ? "First time setup — create the super admin account" : "Sign in with the account you were given"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-t border-dashed border-ink/40" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "email",
						children: "Email"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "email",
						type: "email",
						required: true,
						value: email,
						onChange: (e) => setEmail(e.target.value),
						autoComplete: "email"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "pw",
							children: "Password"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "pw",
							type: "password",
							required: true,
							minLength: 6,
							value: password,
							onChange: (e) => setPassword(e.target.value),
							autoComplete: setup ? "new-password" : "current-password"
						}),
						setup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] opacity-60",
							children: "Use a strong, unique password — common passwords are rejected."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "w-full",
					disabled: busy,
					children: busy ? "Please wait…" : setup ? "Create admin & sign in" : "Sign in"
				})
			]
		})
	});
}
//#endregion
export { AuthPage as component };

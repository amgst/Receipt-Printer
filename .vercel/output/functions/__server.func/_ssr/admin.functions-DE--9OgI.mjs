import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { n as requireFirebaseAuth } from "./auth-middleware-Z9wt_IOA.mjs";
import { n as stringType, t as objectType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-DE--9OgI.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var creds = objectType({
	email: stringType().trim().email().max(255),
	password: stringType().min(6).max(72)
});
function friendly(message) {
	if (message && /weak|easy to guess|pwned|leak/i.test(message)) return "That password is too common. Please choose a stronger, unique password.";
	return message ?? "Something went wrong";
}
async function services() {
	return import("./admin.server-Bfe-Tdis.mjs");
}
async function assertAdmin(userId) {
	const { adminDb } = await services();
	if ((await adminDb.doc(`users/${userId}`).get()).data()?.["role"] !== "admin") throw new Error("Only the super admin can do this.");
}
var hasAdmin_createServerFn_handler = createServerRpc({
	id: "8dfe3e34a14d2f6645640e66033a1e6f17155f003e2d45dac1066a7e2aa10431",
	name: "hasAdmin",
	filename: "src/lib/admin.functions.ts"
}, (opts) => hasAdmin.__executeServer(opts));
var hasAdmin = createServerFn({ method: "GET" }).handler(hasAdmin_createServerFn_handler, async () => {
	const { adminDb } = await services();
	return { exists: !(await adminDb.collection("users").where("role", "==", "admin").limit(1).get()).empty };
});
var bootstrapAdmin_createServerFn_handler = createServerRpc({
	id: "8b5e87060261a59e92bcd5e92ce4cf6afa0ee8e3737aa66e7c16f0be951897c6",
	name: "bootstrapAdmin",
	filename: "src/lib/admin.functions.ts"
}, (opts) => bootstrapAdmin.__executeServer(opts));
var bootstrapAdmin = createServerFn({ method: "POST" }).validator((data) => creds.parse(data)).handler(bootstrapAdmin_createServerFn_handler, async ({ data }) => {
	const { adminAuth, adminDb } = await services();
	if (!(await adminDb.collection("users").where("role", "==", "admin").limit(1).get()).empty) return {
		ok: false,
		error: "A super admin already exists."
	};
	try {
		const user = await adminAuth.createUser({
			email: data.email,
			password: data.password,
			emailVerified: true
		});
		await adminDb.doc(`users/${user.uid}`).set({
			email: data.email,
			role: "admin",
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		});
		return {
			ok: true,
			error: null
		};
	} catch (error) {
		return {
			ok: false,
			error: friendly(error instanceof Error ? error.message : void 0)
		};
	}
});
var listUsers_createServerFn_handler = createServerRpc({
	id: "ae1d531e1714d053869d1e069815a71e199346ef621d80ab0f46be85080718ab",
	name: "listUsers",
	filename: "src/lib/admin.functions.ts"
}, (opts) => listUsers.__executeServer(opts));
var listUsers = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(listUsers_createServerFn_handler, async ({ context }) => {
	await assertAdmin(context.userId);
	const { adminAuth, adminDb } = await services();
	const [authUsers, roleDocs] = await Promise.all([adminAuth.listUsers(1e3), adminDb.collection("users").get()]);
	const roles = new Map(roleDocs.docs.map((item) => [item.id, item.data()["role"]]));
	return authUsers.users.map((user) => ({
		id: user.uid,
		email: user.email ?? "",
		created_at: user.metadata.creationTime,
		last_sign_in_at: user.metadata.lastSignInTime ?? null,
		isAdmin: roles.get(user.uid) === "admin"
	}));
});
var createAppUser_createServerFn_handler = createServerRpc({
	id: "f76fbb6b31afe57825c85b4bc2387067a0af6982673e37cffa2a6460b4687623",
	name: "createAppUser",
	filename: "src/lib/admin.functions.ts"
}, (opts) => createAppUser.__executeServer(opts));
var createAppUser = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((data) => creds.parse(data)).handler(createAppUser_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context.userId);
	const { adminAuth, adminDb } = await services();
	try {
		const user = await adminAuth.createUser({
			email: data.email,
			password: data.password,
			emailVerified: true
		});
		await adminDb.doc(`users/${user.uid}`).set({
			email: data.email,
			role: "user",
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		});
		return {
			ok: true,
			error: null
		};
	} catch (error) {
		return {
			ok: false,
			error: friendly(error instanceof Error ? error.message : void 0)
		};
	}
});
var setUserPassword_createServerFn_handler = createServerRpc({
	id: "0c834f3e659690272834a8a1f124376a939f1884fda5f2b3ee1954d50430d613",
	name: "setUserPassword",
	filename: "src/lib/admin.functions.ts"
}, (opts) => setUserPassword.__executeServer(opts));
var setUserPassword = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((data) => objectType({
	id: stringType().min(1),
	password: stringType().min(6).max(72)
}).parse(data)).handler(setUserPassword_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context.userId);
	const { adminAuth } = await services();
	try {
		await adminAuth.updateUser(data.id, { password: data.password });
		return {
			ok: true,
			error: null
		};
	} catch (error) {
		return {
			ok: false,
			error: friendly(error instanceof Error ? error.message : void 0)
		};
	}
});
var deleteAppUser_createServerFn_handler = createServerRpc({
	id: "6a8705b03d5bbcdbe45a920f94ebdf63baf7c76553e694f851a1347e1fe5b94c",
	name: "deleteAppUser",
	filename: "src/lib/admin.functions.ts"
}, (opts) => deleteAppUser.__executeServer(opts));
var deleteAppUser = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((data) => objectType({ id: stringType().min(1) }).parse(data)).handler(deleteAppUser_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context.userId);
	if (data.id === context.userId) throw new Error("You can't delete yourself.");
	const { adminAuth, adminDb } = await services();
	const receipts = await adminDb.collection(`users/${data.id}/receipts`).get();
	const batch = adminDb.batch();
	receipts.docs.forEach((item) => batch.delete(item.ref));
	batch.delete(adminDb.doc(`shop_settings/${data.id}`));
	batch.delete(adminDb.doc(`users/${data.id}`));
	await batch.commit();
	await adminAuth.deleteUser(data.id);
	return {
		ok: true,
		error: null
	};
});
//#endregion
export { bootstrapAdmin_createServerFn_handler, createAppUser_createServerFn_handler, deleteAppUser_createServerFn_handler, hasAdmin_createServerFn_handler, listUsers_createServerFn_handler, setUserPassword_createServerFn_handler };

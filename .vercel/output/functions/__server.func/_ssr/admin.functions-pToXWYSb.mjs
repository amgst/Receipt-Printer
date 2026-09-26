import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-DdSE2yzO.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { n as requireFirebaseAuth } from "./auth-middleware-Z9wt_IOA.mjs";
import { n as stringType, t as objectType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-pToXWYSb.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var creds = objectType({
	email: stringType().trim().email().max(255),
	password: stringType().min(6).max(72)
});
var hasAdmin = createServerFn({ method: "GET" }).handler(createSsrRpc("8dfe3e34a14d2f6645640e66033a1e6f17155f003e2d45dac1066a7e2aa10431"));
var bootstrapAdmin = createServerFn({ method: "POST" }).validator((data) => creds.parse(data)).handler(createSsrRpc("8b5e87060261a59e92bcd5e92ce4cf6afa0ee8e3737aa66e7c16f0be951897c6"));
var listUsers = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("ae1d531e1714d053869d1e069815a71e199346ef621d80ab0f46be85080718ab"));
var createAppUser = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((data) => creds.parse(data)).handler(createSsrRpc("f76fbb6b31afe57825c85b4bc2387067a0af6982673e37cffa2a6460b4687623"));
var setUserPassword = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((data) => objectType({
	id: stringType().min(1),
	password: stringType().min(6).max(72)
}).parse(data)).handler(createSsrRpc("0c834f3e659690272834a8a1f124376a939f1884fda5f2b3ee1954d50430d613"));
var deleteAppUser = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((data) => objectType({ id: stringType().min(1) }).parse(data)).handler(createSsrRpc("6a8705b03d5bbcdbe45a920f94ebdf63baf7c76553e694f851a1347e1fe5b94c"));
//#endregion
export { listUsers as a, hasAdmin as i, createAppUser as n, setUserPassword as o, deleteAppUser as r, bootstrapAdmin as t };

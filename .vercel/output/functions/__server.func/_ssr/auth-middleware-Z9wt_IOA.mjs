import { n as getRequest, t as createMiddleware } from "./createMiddleware-DZKjvFNc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-middleware-Z9wt_IOA.js
var attachFirebaseAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { currentUser } = await import("./client-NVwGIq0n.mjs").then((n) => n.n).then(async (m) => ({ currentUser: await m.currentUser() }));
	const token = await currentUser?.getIdToken();
	return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
});
var requireFirebaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
	const header = getRequest().headers.get("authorization");
	if (!header?.startsWith("Bearer ")) throw new Error("Unauthorized");
	const { adminAuth } = await import("./admin.server-Bfe-Tdis.mjs");
	const claims = await adminAuth.verifyIdToken(header.slice(7));
	return next({ context: {
		userId: claims.uid,
		claims
	} });
});
//#endregion
export { requireFirebaseAuth as n, attachFirebaseAuth as t };

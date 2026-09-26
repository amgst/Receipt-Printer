import { a as getApps, i as cert, n as getAuth, o as initializeApp, r as applicationDefault, t as getFirestore } from "../_libs/firebase-admin+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.server-Bfe-Tdis.js
function adminApp() {
	if (getApps().length) return getApps()[0];
	const projectId = process.env["FIREBASE_PROJECT_ID"] ?? "receipt-printer-4df14";
	const clientEmail = process.env["FIREBASE_CLIENT_EMAIL"];
	const privateKey = process.env["FIREBASE_PRIVATE_KEY"]?.replace(/\\n/g, "\n");
	const credential = clientEmail && privateKey ? cert({
		projectId,
		clientEmail,
		privateKey
	}) : applicationDefault();
	return initializeApp({
		credential,
		projectId
	});
}
var adminAuth = getAuth(adminApp());
var adminDb = getFirestore(adminApp());
//#endregion
export { adminAuth, adminDb };

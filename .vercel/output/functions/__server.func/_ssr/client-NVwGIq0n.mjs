import { a as getApp, o as getApps, s as initializeApp } from "../_libs/@firebase/app+[...].mjs";
import "../_libs/firebase.mjs";
import { t as getAuth } from "../_libs/firebase__auth.mjs";
import { d as getFirestore } from "../_libs/@firebase/firestore+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-NVwGIq0n.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var client_exports = /* @__PURE__ */ __exportAll({
	auth: () => auth,
	currentUser: () => currentUser,
	db: () => db,
	firebaseApp: () => firebaseApp
});
var firebaseApp = getApps().length ? getApp() : initializeApp({
	apiKey: "AIzaSyAmtmmjVZTZc7u_FWQiU3KZGSl3bZHS7rk",
	authDomain: "receipt-printer-4df14.firebaseapp.com",
	projectId: "receipt-printer-4df14",
	storageBucket: "receipt-printer-4df14.firebasestorage.app",
	messagingSenderId: "663791156046",
	appId: "1:663791156046:web:edc51b2723554790547c1f"
});
var auth = getAuth(firebaseApp);
var db = getFirestore(firebaseApp);
async function currentUser() {
	await auth.authStateReady();
	return auth.currentUser;
}
//#endregion
export { db as i, client_exports as n, currentUser as r, auth as t };
